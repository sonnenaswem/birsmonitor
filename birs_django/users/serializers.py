
from rest_framework import serializers
from .models import CustomUser 
from performance.models import PerformanceTarget 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'area_office', 'gokollect_code', 'role']

class PerformanceTargetSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all()
    )

    class Meta:
        model = PerformanceTarget
        fields = [
            "id",
            "user",
            "month",
            "year",
            "target_amount",
            "created_at",
        ]
        read_only_fields = ["created_at"]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = getattr(user, "role", "") or ""
        token["full_name"] = getattr(user, "full_name", "") or ""
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = getattr(self.user, "role", "") or ""
        data["full_name"] = getattr(self.user, "full_name", "") or ""

        if not hasattr(self.user, "role"):
            raise serializers.ValidationError("User role not found")
    
        return data
    


class OfficerAccountSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    area_office = serializers.CharField(max_length=150)
    hospital = serializers.CharField(max_length=255, required=False)
    target = serializers.DecimalField(max_digits=12, decimal_places=2)
    gokollect_code = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        full_name = validated_data["full_name"].strip().split(" ", 1)

        first_name = full_name[0]
        last_name = full_name[1] if len(full_name) > 1 else ""

        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role="ato",
            first_name=first_name,
            last_name=last_name,
            area_office=validated_data["area_office"],
            hospital=validated_data.get("hospital"),
            gokollect_code=validated_data.get("gokollect_code") or None
        )

        PerformanceTarget.objects.create(
            user=user,
            target_amount=validated_data["target"]
        )

        return user

