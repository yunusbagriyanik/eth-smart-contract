App = {

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
  },


  loadWeb3: async () => {

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


    if (web3.__isMetaMaskShim__) {
      console.log("Connected Metamask...")
    }

    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }


    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {

        await ethereum.enable()

        web3.eth.sendTransaction({
          /* ... */
        })
      } catch (error) {

      }
    } else if (window.web3) {
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
    console.log(App.account)
  },

}

$(() => {
  $(window).load(() => {
    App.load()
  })
})