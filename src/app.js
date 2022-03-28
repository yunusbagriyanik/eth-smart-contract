App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },


  loadWeb3: async () => {
    /*
    function one(el, type, fn) {
      function handler(event) {
        el.removeEventListener(type, handler);
        fn(event);
      }
      el.addEventListener(type, handler);
    }

    one(window, 'click', function() {
      swal("Hello!", "Welcome to the Web3 World!", "success");
    });
    */
    if (web3.__isMetaMaskShim__) {
      console.log("Connected Metamask...")
    }

    if (typeof web3 !== 'undefined') {
      App.web3Provider = window.ethereum
      web3 = new Web3(window.ethereum)
    } else {
      window.alert("Please connect to Metamask.")
    }


    if (window.ethereum) {
      console.log("window.ethereum")
      App.web3Provider = window.ethereum;
      try {
        const selectedAccount = await window.ethereum
          .request({
            method: "eth_requestAccounts",
          })
          .then((accounts) => accounts[0])
          .catch(() => {
            throw Error("No account selected!");
          });

        window.userAddress = selectedAccount;
        window.localStorage.setItem("userAddress", selectedAccount);

        console.log(selectedAccount)
        web3.eth.defaultAccount = web3.eth.accounts[0]
        personal.unlockAccount(web3.eth.defaultAccount)
      } catch (error) {

      }
    } else if (window.web3) {
      console.log("window.web3")
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)

      web3.eth.sendTransaction({
        /* ... */
      })
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {

    App.account = web3.eth.accounts[0]
    console.log("Account: " + App.account)
  },

  loadContract: async () => {
    const taskList = await $.getJSON('TaskList.json')
    console.log(taskList.networks)

    App.contracts.TaskList = TruffleContract(taskList)
    App.contracts.TaskList.setProvider(App.web3Provider)
    console.log(taskList)

    App.taskList = await App.contracts.TaskList.deployed()
  },

  render: async () => {
    if (App.loading) {
      return
    }

    App.setLoading(true)

    $('#account').html(App.account)
    await App.renderTasks()

    App.setLoading(false)
  },

  renderTasks: async () => {
    const taskCount = await App.taskList.taskCount()
    const $taskTemplate = $('.taskTemplate')
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.taskList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
        .prop('name', taskId)
        .prop('checked', taskCompleted)
        .on('click', App.toggleCompleted)

      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      $newTaskTemplate.show()
    }
  },

  doTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    console.log(content)
    const taskCount = await App.taskList.taskCount()
    console.log(taskCount.toNumber())

    await App.taskList.doTask(content)
    window.location.reload()
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.taskList.toggleCompleted(taskId)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }

}

$(() => {
  $(window).load(() => {
    App.load()
  })
})
