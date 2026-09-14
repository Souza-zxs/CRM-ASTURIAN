import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import { type Manifest } from 'zyra-shared/application';
import { z } from 'zod';

import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { ZyraConfigService } from 'src/engine/core-modules/zyra-config/zyra-config.service';

export type RegistryPackageInfo = {
  name: string;
  version: string;
  description: string;
  author: string;
  websiteUrl?: string;
};

const registrySearchResultSchema = z.object({
  objects: z.array(
    z.object({
      package: z.object({
        name: z.string(),
        version: z.string(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        author: z.object({ name: z.string().optional() }).optional(),
        links: z
          .object({
            homepage: z.string().optional(),
            npm: z.string().optional(),
          })
          .optional(),
      }),
    }),
  ),
});

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private readonly zyraConfigService: ZyraConfigService) {}

  async fetchManifestFromRegistryCdn(
    packageName: string,
    version: string,
  ): Promise<Manifest | null> {
    const cdnBaseUrl = this.zyraConfigService.get('APP_REGISTRY_CDN_URL');
    const url = buildRegistryCdnUrl({
      cdnBaseUrl,
      packageName,
      version,
      filePath: 'manifest.json',
    });

    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Zyra-Marketplace' },
        timeout: 5_000,
      });

      if (!data?.application) {
        return null;
      }

      return data as Manifest;
    } catch {
      this.logger.debug(
        `Could not fetch manifest from CDN for ${packageName}@${version}`,
      );

      return null;
    }
  }

  async fetchReadmeFromRegistryCdn(
    packageName: string,
    version: string,
  ): Promise<string | null> {
    const cdnBaseUrl = this.zyraConfigService.get('APP_REGISTRY_CDN_URL');
    const url = buildRegistryCdnUrl({
      cdnBaseUrl,
      packageName,
      version,
      filePath: 'README.md',
    });

    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Zyra-Marketplace' },
        timeout: 5_000,
        responseType: 'text',
      });

      if (!data || data.trim().length === 0) {
        return null;
      }

      return data;
    } catch {
      this.logger.debug(
        `Could not fetch README from CDN for ${packageName}@${version}`,
      );

      return null;
    }
  }

  async fetchAppsFromRegistry(): Promise<RegistryPackageInfo[]> {
    const registryUrl = this.zyraConfigService.get('APP_REGISTRY_URL');

    try {
      const { data } = await axios.get(
        `${registryUrl}/-/v1/search?text=keywords:zyra-app&size=250`,
        {
          headers: { 'User-Agent': 'Zyra-Marketplace' },
          timeout: 10_000,
        },
      );

      const parsed = registrySearchResultSchema.safeParse(data);

      if (!parsed.success) {
        this.logger.warn(
          `Unexpected registry search response shape: ${parsed.error.message}`,
        );

        return [];
      }

      return parsed.data.objects.map((result) => {
        const { name, version, description, author, links } = result.package;

        return {
          name,
          version,
          description: description ?? '',
          author: author?.name ?? 'Unknown',
          websiteUrl: links?.homepage ?? links?.npm,
        };
      });
    } catch (error) {
      this.logger.warn(
        `Failed to fetch apps from registry ${registryUrl}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return [];
    }
  }
}
