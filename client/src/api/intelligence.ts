import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/intelligence`,
});

apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AtRiskAsset {
  id: number;
  assetId: number;
  healthScore: number;
  failureProbability: number;
  carbonFootprintKg: number;
  lastCalculatedAt: string;
  asset: {
    tag: string;
    name: string;
    category: {
      name: string;
    };
  };
}

export interface EcoPredictiveData {
  topAtRiskAssets: AtRiskAsset[];
  totalOrganizationCarbonFootprintKg: number;
}

export interface BenchmarksData {
  maintenance: {
    organizationAverageHours: number;
    globalAverageHours: number;
    verdict: string;
  };
  hardwareReliability: Array<{
    category: string;
    incidents: number;
  }>;
  utilization: {
    organizationUtilizationPct: number;
    globalUtilizationPct: number;
  };
}

export const intelligenceApi = {
  getEcoPredictive: async () => {
    const response = await apiClient.get<EcoPredictiveData>('/eco-predictive');
    return response.data;
  },
  
  getBenchmarks: async () => {
    const response = await apiClient.get<BenchmarksData>('/benchmarks');
    return response.data;
  },
  
  triggerCalculation: async () => {
    const response = await apiClient.post('/eco-predictive/trigger');
    return response.data;
  }
};
