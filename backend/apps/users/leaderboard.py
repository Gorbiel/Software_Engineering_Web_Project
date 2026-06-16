from django.db.models import Count, Sum, Q, F, IntegerField, ExpressionWrapper
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models import User
from apps.achievements.models import Achievement, AchievementConfirmation
from apps.glazes.models import Glaze
from apps.teams.models import Team


class LeaderboardViewSet(viewsets.ViewSet):
    """
    Leaderboard endpoints for ranking users and teams
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def users(self, request):
        """
        Get user leaderboard with various ranking options
        
        Query parameters:
        - metric: 'achievements', 'confirmations', 'glazes_received', 'glazes_sent', 'total_score' (default: 'total_score')
        - team_id: Filter by team (optional)
        - limit: Number of results (default: 50, max: 100)
        """
        metric = request.query_params.get('metric', 'total_score')
        team_id = request.query_params.get('team_id')
        limit = min(int(request.query_params.get('limit', 50)), 100)
        
        queryset = User.users.active()
        
        # Filter by team if specified
        if team_id:
            queryset = queryset.in_team(team_id)
        
        # Annotate with various metrics
        queryset = queryset.annotate(
            achievement_count=Count('achievement', distinct=True),
            confirmations_received=Count(
                'achievement__achievementconfirmation',
                distinct=True
            ),
            confirmations_given=Count(
                'achievementconfirmation',
                distinct=True
            ),
            glazes_received_count=Count('receiver', distinct=True),
            glazes_sent_count=Count('poster', distinct=True),
        )
        
        # Calculate weighted confirmation score
        queryset = queryset.annotate(
            weighted_confirmations=Coalesce(
                Sum(
                    ExpressionWrapper(
                        F('achievement__achievementconfirmation__user__rank'),
                        output_field=IntegerField()
                    )
                ),
                0
            )
        )
        
        # Calculate total score (weighted formula)
        queryset = queryset.annotate(
            total_score=ExpressionWrapper(
                F('achievement_count') * 10 +
                F('weighted_confirmations') * 2 +
                F('glazes_received_count') * 5 +
                F('glazes_sent_count') * 3 +
                F('confirmations_given') * 1,
                output_field=IntegerField()
            )
        )
        
        # Order by selected metric
        order_field = {
            'achievements': '-achievement_count',
            'confirmations': '-confirmations_received',
            'glazes_received': '-glazes_received_count',
            'glazes_sent': '-glazes_sent_count',
            'total_score': '-total_score',
        }.get(metric, '-total_score')
        
        queryset = queryset.order_by(order_field, '-id')[:limit]
        
        # Build response
        results = []
        for rank, user in enumerate(queryset, start=1):
            results.append({
                'rank': rank,
                'user_id': user.id,
                'name': user.name,
                'email': user.email,
                'profile_picture': user.profile_picture.url if user.profile_picture else None,
                'rank_name': user.rank_name,
                'achievement_count': user.achievement_count,
                'confirmations_received': user.confirmations_received,
                'confirmations_given': user.confirmations_given,
                'glazes_received_count': user.glazes_received_count,
                'glazes_sent_count': user.glazes_sent_count,
                'weighted_confirmations': user.weighted_confirmations,
                'total_score': user.total_score,
            })
        
        return Response({
            'metric': metric,
            'team_id': team_id,
            'results': results,
        })
    
    @action(detail=False, methods=['get'])
    def teams(self, request):
        """
        Get team leaderboard
        
        Query parameters:
        - metric: 'achievements', 'glazes', 'engagement', 'participation' (default: 'engagement')
        - limit: Number of results (default: 20, max: 50)
        """
        metric = request.query_params.get('metric', 'engagement')
        limit = min(int(request.query_params.get('limit', 20)), 50)
        
        queryset = Team.teams.all()
        
        # Annotate with metrics
        queryset = queryset.with_member_count()
        queryset = queryset.with_engagement()
        queryset = queryset.with_participation_rate()
        
        # Calculate engagement score
        queryset = queryset.annotate(
            engagement_score=ExpressionWrapper(
                F('achievements_count') * 10 +
                F('glazes_sent_count') * 5 +
                F('glazes_received_count') * 5 +
                F('confirmations_count') * 3,
                output_field=IntegerField()
            )
        )
        
        # Order by selected metric
        order_field = {
            'achievements': '-achievements_count',
            'glazes': '-glazes_sent_count',
            'engagement': '-engagement_score',
            'participation': '-participation_rate',
        }.get(metric, '-engagement_score')
        
        queryset = queryset.order_by(order_field, '-id')[:limit]
        
        # Build response
        results = []
        for rank, team in enumerate(queryset, start=1):
            results.append({
                'rank': rank,
                'team_id': team.id,
                'name': team.name,
                'member_count': team.member_count,
                'achievements_count': team.achievements_count,
                'glazes_sent_count': team.glazes_sent_count,
                'glazes_received_count': team.glazes_received_count,
                'confirmations_count': team.confirmations_count,
                'participation_rate': round(team.participation_rate, 2) if hasattr(team, 'participation_rate') else 0,
                'engagement_score': team.engagement_score,
            })
        
        return Response({
            'metric': metric,
            'results': results,
        })
    
    @action(detail=False, methods=['get'])
    def my_position(self, request):
        """
        Get current user's position in various leaderboards
        """
        user = request.user
        
        # Calculate user's metrics
        user_data = User.users.filter(id=user.id).annotate(
            achievement_count=Count('achievement', distinct=True),
            confirmations_received=Count(
                'achievement__achievementconfirmation',
                distinct=True
            ),
            glazes_received_count=Count('receiver', distinct=True),
            glazes_sent_count=Count('poster', distinct=True),
            weighted_confirmations=Coalesce(
                Sum(
                    ExpressionWrapper(
                        F('achievement__achievementconfirmation__user__rank'),
                        output_field=IntegerField()
                    )
                ),
                0
            ),
        ).annotate(
            total_score=ExpressionWrapper(
                F('achievement_count') * 10 +
                F('weighted_confirmations') * 2 +
                F('glazes_received_count') * 5 +
                F('glazes_sent_count') * 3,
                output_field=IntegerField()
            )
        ).first()
        
        # Calculate positions
        total_score_position = User.users.active().annotate(
            achievement_count=Count('achievement', distinct=True),
            weighted_confirmations=Coalesce(
                Sum(
                    ExpressionWrapper(
                        F('achievement__achievementconfirmation__user__rank'),
                        output_field=IntegerField()
                    )
                ),
                0
            ),
            glazes_received_count=Count('receiver', distinct=True),
            glazes_sent_count=Count('poster', distinct=True),
            total_score=ExpressionWrapper(
                F('achievement_count') * 10 +
                F('weighted_confirmations') * 2 +
                F('glazes_received_count') * 5 +
                F('glazes_sent_count') * 3,
                output_field=IntegerField()
            )
        ).filter(total_score__gt=user_data.total_score).count() + 1
        
        achievements_position = User.users.active().annotate(
            achievement_count=Count('achievement', distinct=True)
        ).filter(achievement_count__gt=user_data.achievement_count).count() + 1
        
        glazes_position = User.users.active().annotate(
            glazes_received_count=Count('receiver', distinct=True)
        ).filter(glazes_received_count__gt=user_data.glazes_received_count).count() + 1
        
        return Response({
            'user_id': user.id,
            'name': user.name,
            'positions': {
                'total_score': {
                    'rank': total_score_position,
                    'score': user_data.total_score,
                },
                'achievements': {
                    'rank': achievements_position,
                    'count': user_data.achievement_count,
                },
                'glazes_received': {
                    'rank': glazes_position,
                    'count': user_data.glazes_received_count,
                },
            },
            'metrics': {
                'achievement_count': user_data.achievement_count,
                'confirmations_received': user_data.confirmations_received,
                'glazes_received_count': user_data.glazes_received_count,
                'glazes_sent_count': user_data.glazes_sent_count,
                'weighted_confirmations': user_data.weighted_confirmations,
                'total_score': user_data.total_score,
            }
        })

# Made with Bob
