"""URL configuration for GraphQL API."""

from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from graphene_django.views import GraphQLView

urlpatterns = [
    # Disable CSRF for the API endpoint (Standard for GraphQL APIs)
    path("graphql/", csrf_exempt(GraphQLView.as_view(graphiql=True))),
]
