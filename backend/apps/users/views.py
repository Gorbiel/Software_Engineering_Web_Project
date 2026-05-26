from django.http import JsonResponse
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.models import User
from apps.users.permissions import IsGlazedInAdmin, IsSelf
from apps.users.serializers import UserSerializer
from apps.users.user_stats import get_user_stats


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


class ProfileViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    permission_classes = [IsSelf]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        user = self.get_object()
        stats = get_user_stats(user)
        return JsonResponse(stats)
