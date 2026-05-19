from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.models import User
from apps.users.permissions import IsGlazedInAdmin
from apps.users.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsGlazedInAdmin]

    def perform_destroy(self, instance):
        instance.active = False
        instance.deactivation_date = timezone.now()
        instance.save(update_fields=["active", "deactivation_date"])

    @action(detail=True, methods=["patch"])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.active = True
        user.deactivation_date = None
        user.save(update_fields=["active", "deactivation_date"])
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=["patch"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.active = False
        user.deactivation_date = timezone.now()
        user.save(update_fields=["active", "deactivation_date"])
        return Response(self.get_serializer(user).data)
