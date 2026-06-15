from rest_framework import serializers

from apps.reactions.models import AchievementReaction, GlazeReaction, Reaction
from apps.reactions.services import get_allowed_reaction_metadata
from apps.users.models import User


class UserBasicSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ["id", "name", "email", "profile_picture"]
		read_only_fields = ["id"]


class ReactionSerializer(serializers.ModelSerializer):
	emoji = serializers.SerializerMethodField()

	class Meta:
		model = Reaction
		fields = ["id", "name", "code", "emoji", "creation_date"]
		read_only_fields = fields

	def get_emoji(self, obj):
		metadata = get_allowed_reaction_metadata(obj.code)
		if metadata is None:
			return None
		return metadata["emoji"]


class AchievementReactionSerializer(serializers.ModelSerializer):
	user = UserBasicSerializer(read_only=True)
	reaction = ReactionSerializer(read_only=True)

	class Meta:
		model = AchievementReaction
		fields = ["id", "user", "reaction", "creation_date"]
		read_only_fields = fields


class GlazeReactionSerializer(serializers.ModelSerializer):
	user = UserBasicSerializer(read_only=True)
	reaction = ReactionSerializer(read_only=True)

	class Meta:
		model = GlazeReaction
		fields = ["id", "user", "reaction", "creation_date"]
		read_only_fields = fields
