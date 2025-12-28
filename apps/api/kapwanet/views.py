"""
Core views for KapwaNet API.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring and frontend connectivity test.
    """
    return Response({
        'status': 'healthy',
        'service': 'kapwanet-api',
        'version': '0.1.0',
    })
