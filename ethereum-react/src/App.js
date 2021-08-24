import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from "./config.js";

class App extends Component {
  UNSAFE_componentWillMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    const transcount = await web3.eth.getTransactionCount(accounts[0]);
    this.setState({
      accounts: accounts,
      balance: balance,
      transcount: transcount,
    });
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS);
    this.setState({ todoList });
    const taskCount = await todoList.methods.taskCount().call();
    this.setState({ taskCount });
    let tasks = [];
    for (var i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call();
      tasks.push(task);
    }
    this.setState({ tasks: tasks });
  }

  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      tasks: [],
      balance: 0,
      transcount: 0,
      loading: true,
    };
  }

  createTask(content) {
    this.setState({ loading: true });
    this.state.todoList.methods
      .createTask(content)
      .send({ from: this.state.accounts[0] })
      .once("receipt", (receipt) => {
        this.setState({ loading: false });
        window.location.reload(false);
      });
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true });
    this.state.todoList.methods
      .toggleCompleted(taskId)
      .send({ from: this.state.accounts[0] })
      .once("receipt", (receipt) => {
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div>
        <div className="container">
          <h3>Account: {this.state.accounts[0]} </h3>
          <h5>
            Balance: {this.state.balance / 10e17}
            ETH
          </h5>
          <h5>Transaction count: {this.state.transcount}</h5>
        </div>

        <div className="tasks">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              this.createTask(this.task.value);
            }}
          >
            <input
              id="newTask"
              ref={(input) => (this.task = input)}
              type="text"
              className="taskname"
              placeholder="Add task..."
              required
            />
            <input type="submit" />
          </form>
          <ul id="taskList">
            {this.state.tasks.map((task, key) => {
              return (
                <div key={key}>
                  <label>
                    <input
                      type="checkbox"
                      name={task.id}
                      defaultChecked={task.completed}
                      ref={(input) => {
                        this.checkbox = input;
                      }}
                      onClick={(event) => {
                        this.toggleCompleted(this.checkbox.name);
                      }}
                    />
                    <span className="content">{task.content}</span>
                  </label>
                </div>
              );
            })}{" "}
          </ul>
          <ul id="completedTaskList"></ul>
        </div>
      </div>
    );
  }
}

export default App;
