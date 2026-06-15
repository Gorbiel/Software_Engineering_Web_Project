from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.reactions.serializers import ReactionSerializer
from apps.reactions.services import list_available_reactions


class ReactionListView(generics.ListAPIView):
	serializer_class = ReactionSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return list_available_reactions()
