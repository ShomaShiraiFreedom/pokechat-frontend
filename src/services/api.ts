import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PokemonResponse {
    answer: string;
    conversation_id: string;
}

// ポケモン情報を取得する関数
export async function getPokemonInfo(name: string, conversationId?: string): Promise<PokemonResponse> {
    console.log(`API呼び出し: ${API_URL}/pokemon`);
    console.log(`API_URL: ${API_URL}`);
    try {
        const response = await axios.post(`${API_URL}/pokemon`, {
            query: name,
            conversation_id: conversationId,
        });
        console.log('APIレスポンス:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching pokemon info:', error);
        if (axios.isAxiosError(error)) {
            console.error('APIエラー詳細:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    baseURL: error.config?.baseURL
                }
            });
        }
        return {
            answer: 'ポケモン情報の取得に失敗しました。もう一度試してください。',
            conversation_id: conversationId || '',
        };
    }
} 