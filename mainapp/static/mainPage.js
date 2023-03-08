
function _(selector){
	return document.querySelector(selector);
}

function __(selector){
	return document.querySelectorAll(selector);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', editPage);
else editPage();


function editPage(){
	if (window.innerHeight > window.innerWidth) _('.mainContainer').dataset.mobile = '';

	setScreenRelatedStyles();

	addInitialChatsToLeftContent();
	
	addEventListenerForMouseIn();

	addOnClickEventListenerToLeftContent();

	activateSendMsgComponent();

	setHeightOfRightContent();
	window.addEventListener('resize', setHeightOfRightContent);

	positionOfChatContentOnWindowResize();
	window.addEventListener('resize', positionOfChatContentOnWindowResize);
	window.addEventListener('resize', scrollTopOnWindowResize);

	_('.rightContent').addEventListener('scroll', dataScrolledOnScroll);

	appendNewMsgsToRightContent();
	
	_('.searchField').addEventListener('input', searchFieldInputHandler);

	_('.settingsImg').addEventListener('click', arrowClicked);
}

function setScreenRelatedStyles(){
	let search = _('.search');
	let settingsImg = _('.settingsImg');
	let searchField = _('.searchField');
	let loupeImg = _('.loupeImg');
	let leftContainer = _('.leftContainer')
	

	__('.inTheTopOfContent').forEach(elem =>{
		elem.style.height = Math.round(window.screen.availHeight * 0.05) + 'px';
		elem.style.padding = Math.round(window.screen.availHeight * 0.01) + 'px';
	});

	__('.content').forEach(elem =>{
		elem.style.top = search.offsetHeight + 'px';

	});

	if (_('.mainContainer').dataset.hasOwnProperty('mobile')){
		leftContainer.style.width = Math.round(window.innerWidth * 0.99) + 'px';
		_('.rightContainer').hidden = true;
	} else {
		leftContainer.style.width = Math.round(window.screen.availWidth * 0.25) + 'px';
	}

	leftContainer.style.marginRight = Math.round(window.innerWidth * 0.002) + 'px';
	
	settingsImg.style.width = Math.round(search.clientHeight * 0.7) + 'px';
	settingsImg.style.height = settingsImg.style.width;

	searchField.style.width = search.clientWidth - settingsImg.offsetWidth * 3.5 + 'px';
	searchField.style.height = Math.round(search.clientHeight * 0.7) + 'px';
	searchField.style.left = settingsImg.offsetWidth + settingsImg.offsetLeft + 'px';

	loupeImg.style.width = settingsImg.style.width;
	loupeImg.style.height = loupeImg.style.width;
	loupeImg.style.left = searchField.offsetWidth + searchField.offsetLeft + 'px';

	if (_('.mainContainer').dataset.hasOwnProperty('mobile')){
		leftContainer.style.width = Math.round(window.innerWidth * 0.99) + 'px';
		_('.rightContainer').hidden = true;
		_('.sendMsg').hidden = true;
	}
}


function addInitialChatsToLeftContent(){

	(async function(){
		let response = await fetch('?get=listOfChats');
		let chats = await response.json();
		addChatsToLeftContent(chats);
		setPositionAndSizeOfSendMsgComponent();
	})();

}


function addChatsToLeftContent(arr){
	let leftContent = _('.leftContent');
	for (let chat of arr){
		let [leftContentDivComponent, img, nicknameSpan, lastMsgSpan] = returnLeftSideChatComponent(chat);
		leftContent.append(leftContentDivComponent);
		positionOfElementsInLeftSideChatComponent(img, nicknameSpan, lastMsgSpan)
	}
}


function returnLeftSideChatComponent(chat){
	let div = document.createElement('div');
	div.style.position = 'relative';
	div.style.padding = Math.round(window.screen.availHeight * 0.01) + 'px';
	let img = document.createElement('img');
	img.classList.add('imgInLeftContent');
	img.style.height = Math.round(window.screen.availHeight * 0.06) + 'px';
	let nicknameSpan = document.createElement('span');
	let lastMsgSpan = document.createElement('span');
	img.src = chat.imgSrc;
	nicknameSpan.textContent = chat.nickname;
	lastMsgSpan.textContent = chat.lastMsg;

	div.dataset.nickname = chat.nickname;
	div.dataset.mouseinBgcolor = '#3E54AC';

	div.classList.add('leftContentChatComponent');

	div.append(img, nicknameSpan, lastMsgSpan);
	
	return [div, img, nicknameSpan, lastMsgSpan];
}

function positionOfElementsInLeftSideChatComponent(img, nicknameSpan, lastMsgSpan){
	nicknameSpan.style.position = 'absolute';
	nicknameSpan.style.paddingLeft = Math.round(window.screen.availHeight * 0.02) + 'px';
	nicknameSpan.style.top = 0 + 'px';
	nicknameSpan.style.color = 'white'

	lastMsgSpan.style.position = 'absolute';
	lastMsgSpan.style.paddingLeft = Math.round(window.screen.availHeight * 0.04) + 'px';
	lastMsgSpan.style.top = nicknameSpan.offsetHeight + 'px';
	lastMsgSpan.style.fontSize = '70%';
	
}


function addEventListenerForMouseIn(){
	document.addEventListener('mouseover', mouseinBgcolor);
	document.addEventListener('mouseout', mouseinBgcolor);

	function mouseinBgcolor(event) {
		let target = event.target.closest('[data-mousein-bgcolor]');
		if (!target) return;
		target.style.backgroundColor = (event.type === 'mouseover') ? target.dataset.mouseinBgcolor : '';
	}
}


function addOnClickEventListenerToLeftContent(){
	_('.leftContent').addEventListener('click', function(event){
		let target = event.target.closest('.leftContentChatComponent');
		if (!target) return;
		
		if (_('.mainContainer').dataset.hasOwnProperty('mobile')){
			_('.leftContainer').hidden = true;
			_('.rightContainer').hidden = false;
			_('.sendMsg').hidden = false;
			setPositionAndSizeOfSendMsgComponent();
			setHeightOfRightContent();

		} else {
			markSelectedLeftContentChatComponent({selected: target});
		}

		changeInTheTopOfContent(target.dataset.nickname);
		getMsgs(target.dataset.nickname).then(msgs => {
			pasteMsgsToRightContent(msgs);
			scrollRightContentToBottom();
		});

		_('.writeMsg').value = '';
	});
}

function markSelectedLeftContentChatComponent({selected}){
	let previousSelected = _('.selectedLeftContentChatComponent');
	if (previousSelected) previousSelected.classList.remove('selectedLeftContentChatComponent');
	selected.classList.add('selectedLeftContentChatComponent');
}

function getMsgs(nickname){
	return (async ()=>{
		let response = await fetch(`?get=chatContent&nickname=${nickname}`);
		let msgs = await response.json();
		return msgs;
	})();
	
}


function pasteMsgsToRightContent(msgs){
	let rightContent = _('.rightContent');
	
	removeAllMsgs();
	
	let top = 0;
	for (let msg of msgs){
		let chatContentDiv = createChatContentDiv(msg);
		rightContent.append(chatContentDiv);
		yourMsgsToLeftSideAndDateToCenter(chatContentDiv);

		chatContentDiv.style.top = top + 'px';
		top += chatContentDiv.offsetHeight + Math.round(window.screen.availHeight * 0.007);

	}
}

function removeAllMsgs(){
	for (elem of Array.from(_('.rightContent').children) ){
		if (elem.classList.contains('chatContent')) elem.remove();
	}
}

function createChatContentDiv(msg){

	let div = document.createElement('div');
	div.classList.add('chatContent');
	div.style.position = 'absolute';
	div.style.margin = Math.round(window.screen.availHeight * 0.01) + 'px';
	div.style.paddingLeft = Math.round(window.screen.availHeight * 0.01) + 'px';
	div.style.paddingRight = Math.round(window.screen.availHeight * 0.01) + 'px';

	let msgSpan = document.createElement('span');
	div.append(msgSpan);

	if (typeof msg === 'string'){
		div.classList.add('chatDate');
		msgSpan.textContent = msg;
		msgSpan.style.color = 'white';
		return div;
	}
	div.classList.add('msgDiv');
	msgSpan.textContent = msg[1];

	let msgRecvTimeSpan = document.createElement('span');
	msgRecvTimeSpan.textContent = msg[2];
	msgRecvTimeSpan.classList.add('msgRecvTimeSpan');

	div.append(msgRecvTimeSpan);

	if (msg[0] === 'y'){
		div.classList.add('yourMsg');
	} else {
		div.classList.add('hisMsg');	
	}

	msgSpan.style.paddingRight = Math.round(window.screen.availHeight * 0.01) + 'px';

	return div;
}

function yourMsgsToLeftSideAndDateToCenter(div){
	if (div.classList.contains('yourMsg')){
		div.style.left = _('.rightContent').offsetWidth - div.offsetWidth - Math.round(window.screen.availHeight * 0.03) + 'px';
	} else if (div.classList.contains('chatDate')) {
		div.style.left = _('.rightContent').offsetWidth / 2 - div.offsetWidth / 2 + 'px';
	}
}

function changeInTheTopOfContent(nickname){
	let previousImg = _('.companionImg');
	let companionDiv = _('.companion');
	if (previousImg){
		_('.companionSpan').textContent = nickname;
		companionDiv.dataset.companionNickname = nickname;
		return;
	}

	let settingsImg = _('.settingsImg');

	let img = document.createElement('img');
	img.classList.add('companionImg');
	img.src = '/static/img.png';

	img.style.left = Math.round(companionDiv.offsetWidth / 20) + 'px';
	img.style.width = settingsImg.style.width;
	img.style.height = settingsImg.style.height;

	let span = document.createElement('span');
	span.classList.add('companionSpan');
	span.textContent = nickname;

	companionDiv.append(img, span);
	companionDiv.dataset.companionNickname = nickname;

	if (_('.mainContainer').dataset.hasOwnProperty('mobile')){
		let back = document.createElement('img');
		back.src = '/static/arrow.png';
		back.style.left = Math.round(companionDiv.offsetWidth / 20) + 'px';
		back.style.width = settingsImg.style.width;
		back.style.height = settingsImg.style.height;
		back.classList.add('backToLeftContent');
		back.addEventListener('click', backToLeftContentOnMobile);
		companionDiv.append(back);
		img.style.left = back.offsetWidth * 1.5 + back.offsetLeft + 'px';
	}

	span.style.left = img.offsetWidth * 1.5 + img.offsetLeft + 'px';

}

function scrollRightContentToBottom(){
	let rightContent = _('.rightContent');
	let bottom = rightContent.scrollHeight - rightContent.clientHeight;

	setTimeout(function scroll(){
		rightContent.scrollBy(0, Math.round(bottom / 30));

		if (rightContent.scrollTop >= bottom) return;
		else setTimeout(scroll, 2);
	}, 2)
}


function activateSendMsgComponent(){
	_('.sendMsg').style.height = Math.round(window.innerHeight * 0.07) + 'px';
	_('.sendButton').addEventListener('click', sendButtonClicked);
	_('.sendButton').ontouchstart = ()=> {
		sendButtonClicked();
		return false;
	};

	setPositionAndSizeOfSendMsgComponent();
	window.addEventListener('resize', setPositionAndSizeOfSendMsgComponent);

}

function sendButtonClicked(){
	let text = _('.writeMsg').value;
	let nickname = _('.companion').dataset.companionNickname;
	if (!text || !nickname) return;
	let csrfToken = _('[name="csrfmiddlewaretoken"]').value;

	( async ()=>{
		let response = await fetch('', {
			method: 'POST',
			body: `["${text}", "${nickname}"]`,
			headers: {
				'X-CSRFTOKEN': csrfToken,
			},
		});
	})()
	.then(()=> oneIteration() )
	.then(()=> scrollRightContentToBottom() );

	_('.writeMsg').value = '';
}

function setPositionAndSizeOfSendMsgComponent(){
	let sendMsgComponent = _('.sendMsg');
	let coords = _('.rightContainer').getBoundingClientRect();
	let writeMsg = _('.writeMsg');

	sendMsgComponent.style.top = coords.bottom - sendMsgComponent.offsetHeight - 10 + 'px';
	sendMsgComponent.style.left = coords.left + 'px';
	sendMsgComponent.style.width = coords.width + 'px';
	writeMsg.style.fontSize = Math.round(writeMsg.clientHeight / 2) + 'px';

	_('.sendButton').style.left = sendMsgComponent.offsetWidth - _('.sendButton').offsetWidth + 'px';
}


function setHeightOfRightContent(){
	let top = _('.rightContent').getBoundingClientRect().top;
	_('.rightContent').style.height = _('.sendMsg').offsetTop - top - Math.round(window.screen.availHeight * 0.01) + 'px';

}


function backToLeftContentOnMobile(){
	if (!_('.mainContainer').dataset.hasOwnProperty('mobile')) return;

	_('.leftContainer').hidden = false;
	_('.rightContainer').hidden = true;
	_('.sendMsg').hidden = true;
	
}


function positionOfChatContentOnWindowResize(){
	let top = 0;

	for (let elem of Array.from(_('.rightContent').children) ){
		if (!elem.classList.contains('chatContent')) continue;
		yourMsgsToLeftSideAndDateToCenter(elem);
		elem.style.top = top + 'px';
		top += elem.offsetHeight + Math.round(window.screen.availHeight * 0.007);

	}
}


function scrollTopOnWindowResize(){
	if (!_('.rightContent').dataset.hasOwnProperty('scrolled')){
		_('.rightContent').dataset.scrolled = _('.rightContent').clientHeight + _('.rightContent').scrollTop;
	}
	_('.rightContent').scrollTop = _('.rightContent').dataset.scrolled - _('.rightContent').clientHeight;

}


function dataScrolledOnScroll(){
	this.dataset.scrolled = this.scrollTop + this.clientHeight;

}


function appendNewMsgsToRightContent(){
	setTimeout(function loop(){
		let rightContent = _('.rightContent');
		let bottom = rightContent.scrollHeight - rightContent.clientHeight;

		let inTheBottom = (rightContent.scrollTop >= bottom && bottom >= 0) ? true : false;
		oneIteration().then(()=>{
			if (inTheBottom) scrollRightContentToBottom();
			setTimeout(loop, 500);
		});
	});
}

async function oneIteration(){
	console.log('in oneIteration');
	let rightContent = _('.rightContent');

	let nickname = _('.companion').dataset.companionNickname;
	if (!nickname) return;
	let msgs = await getMsgs(nickname);
	let chatContentElems = rightContent.querySelectorAll('.chatContent');
	let chatContentElemsArr = Array.from(chatContentElems);

	if (_('.companion').dataset.companionNickname !== nickname ||
	msgs.length === chatContentElemsArr.length) return;
		
	let newMsgs = msgs.slice(chatContentElemsArr.length);
	for (let msg of newMsgs){
		let chatContentDiv = createChatContentDiv(msg);
		rightContent.append(chatContentDiv);
		yourMsgsToLeftSideAndDateToCenter(chatContentDiv);
	}
	positionOfChatContentOnWindowResize();
}


function searchFieldInputHandler(){
	let leftContent = _('.leftContent');
	let searchFor = this.value;
	let settingsImg = _('.settingsImg');

	if (!searchFor){
		clearRightContent();
		addInitialChatsToLeftContent();
		settingsImg.src = '/static/settings.png';
		settingsImg.dataset.button = 'settings';
		return;
	}
	settingsImg.src = '/static/arrow.png';
	settingsImg.dataset.button = 'back';

	(async ()=>{
		let response = await fetch(`?get=searchResult&searchFor=${searchFor}`);
		let users = await response.json();

		clearRightContent();
		addChatsToLeftContent(users);
	})();
}

function clearRightContent(){
	let listOfChatDivs = _('.leftContent').querySelectorAll('.leftContentChatComponent');
	let arrOfChatDivs = Array.from(listOfChatDivs);
	arrOfChatDivs.forEach(div => div.remove());

}

function arrowClicked(){
	if (this.dataset.button !== 'back') return;
	
	_('.searchField').value = '';
	_('.searchField').dispatchEvent(new Event('input'));
	_('.searchField').blur();

}