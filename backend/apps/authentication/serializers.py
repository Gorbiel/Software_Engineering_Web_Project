from django.contrib.auth.hashers import check_password
from rest_framework import serializers

from apps.users.models import User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.active:
            raise serializers.ValidationError("User account is inactive.")

        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = user
        return attrs