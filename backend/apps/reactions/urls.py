from django.urls import path

from apps.reactions.views import ReactionListView

urlpatterns = [
    path("", ReactionListView.as_view(), name="reaction-list"),
]
