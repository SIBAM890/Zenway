import pytest
from backend.surge import SurgeCalculator
from backend.models.surge import Platform
from backend.models.train import Train

def test_surge_formula_normal():
    # Arrange
    platform = Platform(
        id="P1",
        name="Platform 1",
        max_capacity=1000,
        typical_load_peak=600,
        typical_load_offpeak=200
    )
    # No trains delayed
    trains = []
    
    # Act
    assessment = SurgeCalculator.calculate_platform_surge(
        station_id="HWH",
        platform=platform,
        trains=trains,
        simulated_time_str="10:00"
    )
    
    # Assert
    # Base load is typical_load_offpeak = 200.
    # Score = 200/1000 * 100 = 20%
    assert assessment.score == 20.0
    assert assessment.level == "Normal"

def test_surge_formula_critical():
    # Arrange
    platform = Platform(
        id="P1",
        name="Platform 1",
        max_capacity=1000,
        typical_load_peak=600,
        typical_load_offpeak=200
    )
    # Train delayed, arriving within 30 min window (estimated arrival 10:10 relative to 10:00)
    train1 = Train(
        id="T1",
        number="12301",
        name="Rajdhani",
        scheduled_arrival="09:50",
        current_delay_mins=20,
        avg_passengers=600,
        class_breakdown={}
    )
    
    # Act
    assessment = SurgeCalculator.calculate_platform_surge(
        station_id="HWH",
        platform=platform,
        trains=[train1],
        simulated_time_str="10:00"
    )
    
    # Assert
    # Base load 200 + expected 600 = 800.
    # Score = 800/1000 * 100 = 80% (Critical)
    assert assessment.score == 80.0
    assert assessment.level == "Critical"
