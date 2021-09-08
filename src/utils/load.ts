import axios from 'axios';

export const load = async (url: string): Promise<string> => (await axios.get(url)).data;
