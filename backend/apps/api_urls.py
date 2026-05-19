from django.urls import include, path

urlpatterns = [
    path("users/", include("apps.users.urls")),
    path("teams/", include("apps.teams.urls")),
    path("glazes/", include("apps.glazes.urls")),
]
