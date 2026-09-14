# Workflows desativados

O GitHub Actions **só executa** workflows que estão em `.github/workflows/`.
Os arquivos aqui estão **desativados** de propósito: dependem de infra externa que
ainda não foi provisionada (Crowdin, GitHub App dispatcher, repos `ci-privileged` /
`zyra-infra`, imagens Docker publicadas). Assim eles não rodam nem mandam e-mail de falha.

## Como ativar um workflow
1. Provisione a infra que ele precisa — veja **[`../INFRA-SETUP.md`](../INFRA-SETUP.md)**.
2. Defina os secrets/variáveis correspondentes no repo.
3. Mova o arquivo de volta:
   ```bash
   git mv .github/disabled-workflows/<arquivo>.yaml .github/workflows/
   ```

## Pronto pra usar sem conta externa
- **`publish-image.yaml`** — publica as imagens no GHCR usando o `GITHUB_TOKEN`
  (não precisa de Docker Hub). Pode ativar assim que quiser gerar imagens.
