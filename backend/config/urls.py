"""URL configuration for GraphQL API."""

from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from ariadne_django.views import GraphQLView

from .schema import schema

urlpatterns = [
    # Disable CSRF for the API endpoint (Standard for GraphQL APIs)
    path("graphql/", csrf_exempt(GraphQLView.as_view(schema=schema))),
]
