import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class GraphService {
  base = process.env.META_GRAPH_API_BASE || 'https://graph.facebook.com/v20.0';
  token = process.env.META_SYSTEM_USER_TOKEN || '';
  async followersCount(igBusinessId: string) {
    const url = `${this.base}/${igBusinessId}?fields=followers_count&access_token=${this.token}`;
    const { data } = await axios.get(url, { timeout: 10000 });
    return data.followers_count as number;
  }
}
