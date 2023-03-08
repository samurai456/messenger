from .models import CustomUser, Message
from django.db.models import Q


def tostr(num):
	return f'{num}' if num > 9 or num < 0 else f'0{num}'


def getlistofchats(request):
	q = Q(source = request.user) | Q(destination = request.user)
	listofmsgs = Message.objects.filter(q).order_by('-send_time')

	companionlist = []
	for msg in listofmsgs:
		companion = msg.source if msg.source != request.user else msg.destination
		if companion in companionlist: continue
		companionlist.append(companion)

	jsonresponse = []
	for companion in companionlist:
		q = Q(source = companion) | Q(destination = companion)
		text = listofmsgs.filter(q).order_by('-send_time')[0].text
		companiondata = {'nickname' : companion.username,
				'lastMsg' : text, 
				'imgSrc' : '/static/img.png', }
		jsonresponse.append(companiondata)

	return jsonresponse


def getchatcontent(request):
	getnickname = request.GET.get('nickname')
	try: companion = CustomUser.objects.get(username = getnickname)
	except CustomUser.DoesNotExist: return []

	q = 	(Q(source = request.user) & Q(destination = companion)) |   \
		(Q(source = companion) & Q(destination = request.user))
	msgs = Message.objects.filter(q).order_by('send_time')
	if not msgs: return []

	jsonresponse = []
	lastdate = ''
	for msg in msgs:
		currentmsgdate = f'{tostr(msg.send_time.day)}.{tostr(msg.send_time.month)}.{msg.send_time.year}'
		if lastdate != currentmsgdate:
			lastdate = currentmsgdate
			jsonresponse.append(lastdate)

		jsonmsg = [ 'y' if msg.source == request.user else 'h',
				msg.text, 
				f'{tostr(msg.send_time.hour)}:{tostr(msg.send_time.minute)}' ]
		jsonresponse.append(jsonmsg)
		
	return jsonresponse


def getsearchresult(request):
	nicknamecontains = request.GET.get('searchFor')
	if not nicknamecontains: return []
	listofusers = CustomUser.objects.filter(username__icontains = nicknamecontains)

	jsonresponse = []
	for user in listofusers:
		if user == request.user: continue
		userdata = {'nickname' : user.username,
				'lastMsg' : '', 
				'imgSrc' : '/static/img.png', }
		jsonresponse.append(userdata)
	
	return jsonresponse
