import { Injectable } from '@nestjs/common';

import { isAxiosError } from 'axios';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SearchHelpCenterInputZodSchema } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

@Injectable()
export class SearchHelpCenterTool implements Tool {
  description =
    'Search Zyra documentation and help center to find information about features, setup, usage, and troubleshooting.';
  inputSchema = SearchHelpCenterInputZodSchema;

  constructor(
    private readonly zyraConfigService: ZyraConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { query } = parameters;

    try {
      const MINTLIFY_API_KEY = this.zyraConfigService.get('MINTLIFY_API_KEY');
      const MINTLIFY_SUBDOMAIN =
        this.zyraConfigService.get('MINTLIFY_SUBDOMAIN');

      const useDirectApi = MINTLIFY_API_KEY && MINTLIFY_SUBDOMAIN;

      const endpoint = useDirectApi
        ? `https://api-dsc.mintlify.com/v1/search/${MINTLIFY_SUBDOMAIN}`
        : 'https://zyra-help-search.com/search/zyra';

      const headers = {
        'Content-Type': 'application/json',
        ...(useDirectApi && { Authorization: `Bearer ${MINTLIFY_API_KEY}` }),
      };

      const httpClient = this.secureHttpClientService.getHttpClient();

      const response = await httpClient.post(
        endpoint,
        { query, pageSize: 10 },
        { headers },
      );

      const results = response.data;

      if (results.length === 0) {
        return {
          success: true,
          message: `No help center articles found for "${query}"`,
          result: [],
        };
      }

      return {
        success: true,
        message: `Found ${results.length} relevant help center article${results.length === 1 ? '' : 's'} for "${query}"`,
        result: results,
      };
    } catch (error) {
      const errorDetail = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Help center search failed';

      return {
        success: false,
        message: `Failed to search help center for "${query}"`,
        error: errorDetail,
      };
    }
  }
}
