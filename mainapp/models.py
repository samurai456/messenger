from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
	password = models.CharField(max_length = 40)

class Message(models.Model):
	text = models.CharField(max_length = 500)
	send_time = models.DateTimeField(auto_now_add = True, db_index = True)
	source = models.ForeignKey("CustomUser", on_delete = models.CASCADE, related_name = "src", null = True)
	destination = models.ForeignKey("CustomUser", on_delete = models.CASCADE, default = None, null = True)

	def __str__(self):
		return self.source.username