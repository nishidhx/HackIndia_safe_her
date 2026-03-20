package services

import "server/internal/ai"

type RiskService struct {
	aiClient *ai.CohereClient
}

func NewRiskService(aiClient *ai.CohereClient) *RiskService {
	return &RiskService{
		aiClient: aiClient,
	}
}

func (s *RiskService) GetRiskScore(lat, lng float64) int {
	return 65
}

func (s *RiskService) GetRiskExplanation(data string) (string, error) {
	return s.aiClient.ExplainRisk(data)
}
