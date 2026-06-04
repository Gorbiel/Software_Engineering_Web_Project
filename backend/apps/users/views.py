from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models import User
from apps.users.serializers import UserSearchSerializer, UserSerializer
from apps.users.user_stats import get_user_stats
from common.pagination import SearchResultsSetPagination
from common.permissions import IsGlazedInAdmin, IsSelf


class UserSearchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Search users by name, email, job_title, and bio_text.

    Query parameters:
    - q: Search query (required)
    - sort_by: 'name', 'creation_date' (default: 'name')
    - order: 'asc', 'desc' (default: 'asc')
    - page_size: Number of results per page (default: 20, max: 100)
    - active: 'true', 'false' (optional, filters by active status)
    """

    queryset = User.objects.all()
    serializer_class = UserSearchSerializer
    pagination_class = SearchResultsSetPagination

    SORT_OPTIONS = ["name", "creation_date", "email"]
    FILTER_OPTIONS = ["active"]

    @action(detail=False, methods=["get"])
    def filters_and_sorting(self, request):
        """Expose available filters and sorting options for the frontend."""
        return Response(
            {
                "sort_options": self.SORT_OPTIONS,
                "filter_options": self.FILTER_OPTIONS,
            }
        )

    def get_queryset(self):
        queryset = User.objects.all()
        search_query = self.request.query_params.get("q", "").strip()

        if not search_query:
            return queryset.none()

        # Search across multiple fields
        queryset = queryset.filter(
            Q(name__icontains=search_query)
            | Q(email__icontains=search_query)
            | Q(job_title__icontains=search_query)
            | Q(bio_text__icontains=search_query)
        )

        # Filter by active status if provided
        active_filter = self.request.query_params.get("active")
        if active_filter == "true":
            queryset = queryset.filter(active=True)
        elif active_filter == "false":
            queryset = queryset.filter(active=False)

        # Sorting
        sort_by = self.request.query_params.get("sort_by", "name")
        if sort_by not in self.SORT_OPTIONS:
            sort_by = "name"

        order = self.request.query_params.get("order", "asc")
        if order == "desc":
            sort_by = f"-{sort_by}"

        queryset = queryset.order_by(sort_by)

        return queryset


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    # Require authentication first, then check admin rights
    permission_classes = [IsAuthenticated, IsGlazedInAdmin]

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
    # Only allow the logged-in user to access their own profile
    permission_classes = [IsAuthenticated, IsSelf]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        user = self.get_object()
        stats = get_user_stats(user)
        return JsonResponse(stats)
