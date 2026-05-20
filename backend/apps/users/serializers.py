from rest_framework import serializers

from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "password",
            "creation_date",
            "active",
            "deactivation_date",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = [
            "id",
            "creation_date",
            "deactivation_date",
            "is_staff",
            "is_superuser",
        ]

    def create(self, validated_data):
        if "password" not in validated_data:
            raise serializers.ValidationError({"password": "This field is required."})
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password is not None:
            instance.set_password(password)

        instance.save()
        return instance
