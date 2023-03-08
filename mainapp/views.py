from django.shortcuts import render, redirect
from django.http import JsonResponse
import json
from django.db.models import Q
from .models import CustomUser, Message
from django.contrib.auth import login, logout
from .helpers import getlistofchats, getchatcontent, getsearchresult


def signin(request):
	#if request.user.is_authenticated:
	#	return redirect('/main/')

	if request.method != 'POST':
		return render(request, 'signInPage.html')

	requestbody = json.loads(request.body.decode('utf-8'))
		
	q = 	(Q(email = requestbody['nicknameOrEmail']) | 	\
		Q(username = requestbody['nicknameOrEmail'])) & \
		Q(password = requestbody['password'])

	jsonresponse = {'access' : False}

	try: user = CustomUser.objects.get(q)
	except CustomUser.DoesNotExist:
		return JsonResponse(jsonresponse)
	
	jsonresponse = {'access' : True, 'pathname' : '/main/'}
	login(request, user)
	return JsonResponse(jsonresponse)


def main(request):
	if not request.user.is_authenticated:
		return redirect('/sign-in/')

	if request.method == 'POST':
		text, nickname = json.loads(request.body.decode('utf-8'))
		try: companion = CustomUser.objects.get(username = nickname)
		except CustomUser.DoesNotExist:
			return JsonResponse({})

		msg = Message()
		msg.source = request.user
		msg.destination = companion
		msg.text = text
		msg.save()
		return JsonResponse({})

	getparam = request.GET.get('get')
	if not getparam:
		return render(request, 'mainPage.html')

	if getparam == 'listOfChats':
		jsonresponse = getlistofchats(request)

	if getparam == 'chatContent':
		jsonresponse = getchatcontent(request)

	if getparam == 'searchResult':
		jsonresponse = getsearchresult(request)
		
	return JsonResponse(jsonresponse, safe = False)





