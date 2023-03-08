'use strict';

let formDiv;

if (document.readyState == 'loading'){
	document.addEventListener('DOMContentLoaded', editPage);
} else {
	editPage();
}


function editPage(){
	formDiv = document.querySelector('#formDiv');

	setStyleOfFormDiv();

	window.addEventListener('resize', keepDivInCenter);	
	addEventListenersOfDivElements();
	
}


function setStyleOfFormDiv(){
	let arrOfChildren = Array.from(formDiv.children);
	let elemHeight = Math.round(window.screen.availHeight / 14);

	arrOfChildren.forEach(elem => {

		elem.style.height = elemHeight + 'px';

		elem.style.margin = Math.round(elemHeight * 0.05) + 'px';
		elem.style.padding = Math.round(elemHeight * 0.05) + 'px';

		elem.style.fontSize = Math.round(elemHeight * 0.8) + 'px';

		if (elem.dataset.hasOwnProperty('text')){
			elem.style.fontSize = Math.round(elemHeight * 0.4) + 'px';
		}

	});
	
	formDiv.style.top = Math.round(elemHeight * 14 / 4) + 'px';

	keepDivInCenter();
}


function keepDivInCenter(){

	let divWidth = getDivWidth();
	formDiv.style.width = divWidth + 'px';

	for (let elem of formDiv.children) elem.style.width = divWidth + 'px';	
	formDiv.style.left = document.documentElement.clientWidth / 2 - formDiv.offsetWidth / 2 + 'px';

	errorMessagesLeftAndWidthOnWindowResize();
}


function getDivWidth(){
	let divide;
	if (window.screen.availHeight > window.screen.availWidth) divide = 1.5;
	else divide = 4;
	return Math.round(window.screen.availWidth / divide);
}


function addEventListenersOfDivElements(){
	
	formDiv.addEventListener('click', function(event){					//might be more options in the future
		console.log(event.target.tagName, 'click');
		if (event.target.tagName === 'BUTTON' ) formButtonClicked();
		else if (event.target.dataset.hasOwnProperty('href') ) location.href = event.target.dataset.href;
	});

	formDiv.addEventListener('keydown', function(event){
		if (!(event.code === 'Enter' && event.target.tagName === 'INPUT')) return;
		let inputElements = this.querySelectorAll('input');
		if (event.target === inputElements[inputElements.length - 1]){
			event.target.nextElementSibling.dispatchEvent(new Event('click', {bubbles: true}) );
			return;
		}
		event.target.nextElementSibling.focus()
	});


	formDiv.addEventListener('input', function(event){
		console.log('input', event.target.tagName);
		if (event.target.dataset.hasOwnProperty('lowerCase')) event.target.value = event.target.value.toLowerCase();
	});


	formDiv.addEventListener('mouseover', function(event){
		if (event.target.tagName === 'INPUT') event.target.style.backgroundColor = '#eeeeee';
		if (event.target.tagName === 'BUTTON') event.target.style.backgroundColor = 'silver';
	});


	formDiv.addEventListener('mouseout', function(event){
		if (!(event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON')) return;
		event.target.style.backgroundColor = '';
	});


	formDiv.addEventListener('blur', function(event){
		console.log(event.target.name, 'blur')
		if (event.target.tagName !== 'INPUT') return;
		onBlurHandler(event.target);
	}, {capture: true});


	formDiv.addEventListener('focus', function(event){
		console.log(event.target.name, 'focus')
		if (event.target.tagName !== 'INPUT') return;
		deleteErrorMessageDiv('from-server');
		deleteErrorMessageDiv(event.target.dataset.validator);
		event.target.style.borderColor = '';
	}, {capture: true});
}


function showErrorMessage(message, id){
	if (document.getElementById(id) || !message) return;
	
	let messageDiv = document.createElement('div');

	if (id === 'choose-nickname') messageDiv.dataset.level = '1';				//to be continued....
	else if (id === 'set-email') messageDiv.dataset.level = '2';
	else if (id === 'choose-password') messageDiv.dataset.level = '3';
	else if (id === 'repeat-chosen-password') messageDiv.dataset.level = '4';
	else if (id === 'nickname') messageDiv.dataset.level = '1';
	else if (id === 'password') messageDiv.dataset.level = '2';
	else messageDiv.dataset.level = '5';
	
	messageDiv.innerHTML = message;
	messageDiv.id = id;
	messageDiv.style.fontSize = Math.round(formDiv.firstElementChild.style.fontSize.slice(0, -2) * 0.6) + 'px';
	messageDiv.className = 'errorMessage';
	document.body.append(messageDiv);

	messageDiv.style.left = formDiv.offsetLeft + 'px';
	messageDiv.style.width = formDiv.clientWidth + 'px';
	positionateErrorMessages();
}


function deleteErrorMessageDiv(id){
	let messageDiv = document.getElementById(id);
	if (!messageDiv) return;
	messageDiv.remove();
	positionateErrorMessages();
}


function positionateErrorMessages(){
	let errorMessages = document.querySelectorAll('.errorMessage');
	let arrOfErrorMessages = Array.from(errorMessages);
	arrOfErrorMessages.sort((a, b) => a.dataset.level - b.dataset.level);
	let formDivBottom = formDiv.offsetTop + formDiv.offsetHeight;

	let positionTop = 0;
	for (let elem of arrOfErrorMessages) {
		elem.style.top = positionTop + 'px';
		positionTop = elem.offsetTop + elem.offsetHeight;

		if (positionTop < formDivBottom && positionTop >= formDiv.offsetTop){
			elem.style.top = formDivBottom + 'px';
			positionTop = elem.offsetTop + elem.offsetHeight;
		}
	}	
}


function errorMessagesLeftAndWidthOnWindowResize(){
	let errorMessages = document.querySelectorAll('.errorMessage');

	for (let elem of errorMessages){
		elem.style.left = formDiv.offsetLeft + 'px';
		elem.style.width = formDiv.clientWidth + 'px';
	}

	positionateErrorMessages();
}


function formButtonClicked(){
	let trigger = true;
	let requestBody = {};
	for (let elem of Array.from(formDiv.children)){
		if (elem.tagName !== 'INPUT') continue;
		if (elem.type === 'hidden') continue;
		elem.dispatchEvent(new Event('blur', {bubbles: true}));
		requestBody[elem.name] = elem.value;
		if (!elem.dataset.hasOwnProperty('valid')) trigger = false;
	}
	if (!trigger) return;

	let jsonResponse;
	
	( async ()=>{ 
		let response = await fetch('', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'X-CSRFTOKEN': document.querySelector('[name="csrfmiddlewaretoken"]').value,
			},
		});
		jsonResponse = await response.json();

		serverResponse(jsonResponse);
	})();

}

function serverResponse(response){
	if (response.access) location.pathname = response.pathname
	else showErrorMessage('invalid password or nickname or email', 'from-server')

}


function onBlurHandler(elem){
	let validation;
	switch (elem.dataset.validator){
		case 'nickname':
			validation = nicknameValidation(elem.value);
			break;
		case 'password':
			validation = passwordValidation(elem.value);
			break;
		case 'choose-nickname':
			validation = chosenNicknameValidation(elem.value);
			break;
		case 'set-email':
			validation = setEmailValidation(elem.value);
			break;
		case 'choose-password':
			validation = chosenPasswordValidation(elem.value);
			break;
		case 'repeat-chosen-password':
			validation = repeatChosenPasswordValidation(elem.value, elem.previousElementSibling.value);
			break;
		default:
			return;
	}


	if (!validation.valid){
		console.log('error messge', validation.errorMessage);
		showErrorMessage(validation.errorMessage, elem.dataset.validator);
		event.target.style.borderColor = 'red';

		delete elem.dataset.valid;

		return;
	}
	
	deleteErrorMessageDiv(elem.dataset.validator);
	event.target.style.borderColor = '';
	elem.dataset.valid = '';
}


function nicknameValidation(nickname){
	let obj = {};

	if ( !/^[a-z0-9_@]*$/.test(nickname) || nickname.length < 5){
		obj.valid = false;
		obj.errorMessage = 'Nickname or email are invalid.';
	}

	if (!nickname){
		obj.valid = false;
		obj.errorMessage = 'Nickname or email field can not be empty.';
	}
	
	if (Object.keys(obj).length) return obj;

	obj.valid = true;
	return obj;
}


function passwordValidation(password){
	let obj = {};

	if ( !/^[A-Za-z0-9_]*$/.test(password) || password.length < 5){
		obj.valid = false;
		obj.errorMessage = 'Invalid password.';
	}

	if (!password){
		obj.valid = false;
		obj.errorMessage = 'Fill the password field.';
	}
	
	if (Object.keys(obj).length) return obj;

	obj.valid = true;
	return obj;
}


function chosenNicknameValidation(nickname){
	let obj = {};

	if (nickname.length < 5){
		obj.valid = false;
		obj.errorMessage = 'Nickname can not be shorter than 5 symbols';
	}

	if ( !/^[a-z0-9_]*$/.test(nickname)){
		obj.valid = false;
		obj.errorMessage = 'Nickname can contain only lower case englesh letters (a-z), numbers (0-9), and underscore symbols "_"';
	}

	if (!nickname){
		obj.valid = false;
		obj.errorMessage = 'Nickname can not be empty';
	}
	
	if (Object.keys(obj).length) return obj;

	obj.valid = true;
	return obj;
}


function setEmailValidation(email){
	let obj = {};

	if (!email.includes('@')){
		obj.valid = false;
		obj.errorMessage = 'Invalid email.';
	}

	if (!email){
		obj.valid = false;
		obj.errorMessage = 'Fill the email field.';
	}
	
	if (Object.keys(obj).length) return obj;

	obj.valid = true;
	return obj;

}


function chosenPasswordValidation(password){
	let obj = {};

	if (password.length < 6){
		obj.valid = false;
		obj.errorMessage = 'Password should contain at least 6 symbols.';
	}

	if ( !/^[A-Za-z0-9_]*$/.test(password)){
		obj.valid = false;
		obj.errorMessage = 'Password can not contain any symbols except english letters (a-z)(A-Z), numbers (0-9) and underscore symbol "_"';
	}

	if (!password){
		obj.valid = false;
		obj.errorMessage = 'Fill the password field.';
	}
	
	if (Object.keys(obj).length) return obj;

	obj.valid = true;
	return obj;
}

function repeatChosenPasswordValidation(repeatedPassword, chosenPassword){
	let obj = {};
	
	if (repeatedPassword !== chosenPassword){
		obj.valid = false;
		obj.errorMessage = 'repeat password correctly';
	}
	
	if (!chosenPasswordValidation(chosenPassword).valid){
		obj.valid = false;
		obj.errorMessage = '';
	}

	if (Object.keys(obj).length) return obj;
	
	obj.valid = true;
	return obj;
}
