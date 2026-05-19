from django.db import models


class UserQuerySet(models.QuerySet):
    def active(self):
        return self.filter(active=True)

    def inactive(self):
        return self.filter(active=False)


class User(models.Model):
    """
        Normal user
        name - combined name and surname / username
        creation_date - set automatically
        active - sets the user as active, defaults to True
        deactivation_date - set automatically
    """


    name = models.CharField(max_length=64)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    creation_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    deactivation_date = models.DateTimeField(default=None, blank=True, null=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="deleted_after_created",
                condition=models.Q(creation_date__lt=models.F("deactivation_date"))
                | models.Q(deactivation_date__isnull=True),
            ),
        ]

    objects = models.Manager()
    users = UserQuerySet.as_manager()


class Admin(models.Model):
    """
        Defines a user with administrative privileges in the app.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)