'use strict'

let contractAddress = $('#contractAddress');
let deployedContractAddressInput = $('#deployedContractAddressInput');
let loadDeployedContractButton = $('#loadDeployedContractButton');
let deployNewContractButton = $('#deployNewContractButton');

let killContractButton = $('#killContractButton')

let whoami = $('#whoami');
let whoamiButton = $('#whoamiButton');
let copyButton = $('#copyButton');

let update = $('#update');

let logger = $('#logger');


let createName = $('#createName');
let createStartTime = $('#createStartTime');
let createEndTime = $('#createEndTime');
let createElectionButton = $('#createElectionButton');

let createCandidateID1 = $('#createCandidateID1');
let CandidateAccount1 = $('#createCandidateAccount1');
let createCandidateButton = $('#createCandidateButton');

let vote1 = $('#vote1');
let voteButton = $('#voteButton');

let startToVoteButton = $('#startToVoteButton');
let endToVoteButton = $('#endToVoteButton');

let open = $('#open');
let counts = $('#counts');
let openButton = $('#openButton');

let idToCandidate = $('#idToCandidate');
let idToCandidateAccount= $('#idToCandidateAccount');
let idToCandidateButton= $('#idToCandidateButton');

let electionNameButton = $('#electionNameButton')


let voteAddress = "";
let nowAccount = "";


let web3 = new Web3('http://localhost:8545');

let vote = new web3.eth.Contract(voteAbi);

function log(...inputs) {
	for (let input of inputs) {
		if (typeof input === 'object') {
			input = JSON.stringify(input, null, 2)
		}
		logger.html(input + '\n' + logger.html())
	}
}

init()

async function init() {
	let accounts = await web3.eth.getAccounts()

	for (let account of accounts) {
		whoami.append(`<option value="${account}">${account}</option>`)
	}
	nowAccount = whoami.val();

	update.trigger('click')

	log(accounts, '以太帳戶')
}

// 當按下載入既有合約位址時
loadDeployedContractButton.on('click', function () {
	loadVote(deployedContractAddressInput.val())
})

// 當按下部署合約時
deployNewContractButton.on('click', function () {
	newVote()
})

// 當按下登入按鍵時
whoamiButton.on('click', function () {
    console.log("1");
	nowAccount = whoami.val();

	update.trigger('click')

})

// 當按下複製按鍵時
copyButton.on('click', function () {
	let textarea = $('<textarea />')
	textarea.val(whoami.val()).css({
		width: '0px',
		height: '0px',
		border: 'none',
		visibility: 'none'
	}).prependTo('body')

	textarea.focus().select()

	try {
		if (document.execCommand('copy')) {
			textarea.remove()
			return true
		}
	} catch (e) {
		console.log(e)
	}
	textarea.remove()
	return false
})

// 當按下更新按鍵時
update.on('click', async function () {
	if (voteAddress != "") {
        console.log("err")
        let ethBalance = await web3.eth.getBalance(nowAccount)
        //let nowAccount1 = nowAccount;
		log({
            address: voteAddress,
            ethBalance: ethBalance,
            
		})
        log('更新帳戶資料')
        $('#ethBalance').text('以太帳戶餘額 (wei): ' + ethBalance)
		$('#nowAddress').text('登入狀態:' + whoami.val())
		
	}
	else {
		console.log("error")
	}
})

// 載入vote合約
function loadVote(address) {
	if (!(address === undefined || address === null || address === '')) {

		let vote_temp = new web3.eth.Contract(voteAbi);
		vote_temp.options.address = address;

		if (vote_temp != undefined) {
			voteAddress = address;
			vote.options.address = voteAddress;

			contractAddress.text('合約位址:' + address)
			log(vote, '載入合約')

			update.trigger('click')
		}
		else {
			log(address, '載入失敗')
		}
	}
}

// 新增vote合約
async function newVote() {
    console.log("111")
	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 更新介面
	waitTransactionStatus()

	vote.deploy({
		data: voteBytecode
	})
		.send({
			from: nowAccount,
			gas: 3400000
		})
		.on('receipt', function (receipt) {
			log(receipt, '部署合約')

			// 更新合約介面
			voteAddress = receipt.contractAddress
			vote.options.address = voteAddress;
			contractAddress.text('合約位址:' + receipt.contractAddress)
			deployedContractAddressInput.val(receipt.contractAddress)

			update.trigger('click');

			// 更新介面
			doneTransactionStatus();
		})
}

function waitTransactionStatus() {
	$('#accountStatus').html('帳戶狀態 <b style="color: blue">(等待交易驗證中...)</b>')
}


function doneTransactionStatus() {
	$('#accountStatus').text('帳戶狀態')
}

async function unlockAccount() {
	let password = prompt("請輸入你的密碼", "");
	if (password == null) {
		return false;
	}
	else {
		return web3.eth.personal.unlockAccount(nowAccount, password, 60)
			.then(function (result) {
				return true;
			})
			.catch(function (err) {
				alert("密碼錯誤")
				return false;
			});
	}
}

createElectionButton.on('click', async function () {
    console.log("createElection");
	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 更新介面
	waitTransactionStatus()
	// 轉帳
	vote.methods.createElection(createName.val()).send({
		from: nowAccount,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			log(receipt.events.CreatElection.returnValues, '建立成功')

			// 觸發更新帳戶資料
			update.trigger('click')

			// 更新介面 
			doneTransactionStatus()
		})
		.on('error', function (error) {
			log(error.toString())
			// 更新介面 
			doneTransactionStatus()
		})
})

createCandidateButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 更新介面
	waitTransactionStatus()
	// 轉帳
	vote.methods.createCandidate(parseInt(createCandidateID1.val(),10), CandidateAccount1.val()).send({
		from: nowAccount,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			log(receipt.events.CreatCandidate.returnValues, '建立候選人成功')

			// 觸發更新帳戶資料
			update.trigger('click')

			// 更新介面 
			doneTransactionStatus()
		})
		.on('error', function (error) {
			log(error.toString())
			// 更新介面 
			doneTransactionStatus()
		})
})

voteButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 更新介面
	waitTransactionStatus()
	// 轉帳
	vote.methods.voting(parseInt(vote1.val(),10)).send({
		from: nowAccount,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			log(receipt.events.Voting.returnValues, '投票成功')

			// 觸發更新帳戶資料
			update.trigger('click')

			// 更新介面 
			doneTransactionStatus()
		})
		.on('error', function (error) {
			log(error.toString())
			// 更新介面 
			doneTransactionStatus()
		})
})

startToVoteButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 更新介面
	waitTransactionStatus()
	// 轉帳
	vote.methods.startToVote().send({
		from: nowAccount,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			log(receipt.events.StartToVote.returnValues, '開始投票')

			// 觸發更新帳戶資料
			update.trigger('click')

			// 更新介面 
			doneTransactionStatus()
		})
		.on('error', function (error) {
			log(error.toString())
			// 更新介面 
			doneTransactionStatus()
		})
})

endToVoteButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 更新介面
	waitTransactionStatus()
	// 轉帳
	vote.methods.endToVote().send({
		from: nowAccount,
		gas: 3400000
	})
		.on('receipt', function (receipt) {
			log(receipt.events.EndToVote.returnValues, '開始投票')

			// 觸發更新帳戶資料
			update.trigger('click')

			// 更新介面 
			doneTransactionStatus()
		})
		.on('error', function (error) {
			log(error.toString())
			// 更新介面 
			doneTransactionStatus()
		})
})

openButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	// 轉帳
    let counts = await vote.methods.getCount(parseInt(open.val(),10)).call({from: nowAccount})
    log({
        counts : counts
    })
    log('更新帳戶資料')

    $('#counts').text('得票數: ' + counts + ' 票');
})

idToCandidateButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	
    let CandidateAccount = await vote.methods.getCandidate(parseInt(idToCandidate.val(),10)).call({from: nowAccount})
    log({
        CandidateAccount : CandidateAccount
    })
    log('更新帳戶資料')

    $('#idToCandidateAccount').text('查詢候選人為: ' + String(CandidateAccount) );
})

electionNameButton.on('click', async function () {

	if (voteAddress == "") {
		return;
	}

	// 解鎖
	let unlock = await unlockAccount();
	if (!unlock) {
		return;
	}

	
    let name = await vote.methods.getName().call({from: nowAccount})
    log({
        name : name
    })
    log('更新帳戶資料')

    $('#electionName').text(String(name));
})


