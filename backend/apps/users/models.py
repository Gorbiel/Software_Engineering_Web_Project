from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserQuerySet(models.QuerySet):
    def active(self):
        return self.filter(active=True)

    def inactive(self):
        return self.filter(active=False)

    def in_team(self, team):
        return self.filter(teammember__team=team)


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("active", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=64)
    email = models.EmailField(unique=True)

    creation_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    deactivation_date = models.DateTimeField(default=None, blank=True, null=True)

    is_staff = models.BooleanField(default=False)

    profile_picture = models.ImageField(
        upload_to="media/", default=None, blank=True, null=True
    )
    job_title = models.CharField(max_length=128, default=None, blank=True, null=True)
    bio_text = models.TextField(default=None, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()
    users = UserQuerySet.as_manager()

    @property
    def is_active(self):
        return self.active

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="active_user_has_no_deactivation_date",
                condition=(
                    models.Q(active=True, deactivation_date__isnull=True)
                    | models.Q(active=False, deactivation_date__isnull=False)
                ),
            ),
        ]

    def __str__(self):
        return f"{self.name} <{self.email}>"


class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Admin: {self.user.email}"
