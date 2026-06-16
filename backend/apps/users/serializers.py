from rest_framework import serializers

from apps.users.models import User


class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer for user search results."""

    rank_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "job_title",
            "bio_text",
            "profile_picture",
            "creation_date",
            "active",
            "rank",
            "rank_name",
        ]
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    rank_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "password",
            "job_title",
            "bio_text",
            "profile_picture",
            "creation_date",
            "active",
            "deactivation_date",
            "is_staff",
            "is_superuser",
            "rank",
            "rank_name",
        ]
        read_only_fields = [
            "id",
            "creation_date",
            "deactivation_date",
            "is_staff",
            "is_superuser",
            # Users should not be allowed to toggle their own active status via
            # the profile endpoint; admins manage activation.
            "active",
            "rank",
            "rank_name",
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


class RankField(serializers.Field):
    """Accept either an integer rank or a textual rank name and normalize to int."""

    def to_internal_value(self, data):
        if isinstance(data, int):
            if 1 <= data <= 100:
                return data
            raise serializers.ValidationError("Rank must be between 1 and 100")

        if isinstance(data, str):
            try:
                return User.rank_value_from_name(data)
            except ValueError as exc:
                raise serializers.ValidationError("Invalid rank name") from exc

        raise serializers.ValidationError("Invalid type for rank")

    def to_representation(self, value):
        return int(value)


class UserRankSerializer(serializers.Serializer):
    rank = RankField()


class UserRankResponseSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(source="id")
    rank = serializers.IntegerField()
    rank_name = serializers.CharField()
