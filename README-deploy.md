# Deploy HostGator/cPanel

Este site esta preparado para deploy pelo Git Version Control do cPanel.

## Fluxo

1. O repositorio local aponta para `https://github.com/mateusrucci/sourfit.git`.
2. No cPanel da HostGator, crie/conecte um repositorio Git usando a mesma URL.
3. Depois de cada `git push`, abra o Git Version Control no cPanel e rode `Update from Remote` e depois `Deploy HEAD Commit`.
4. O arquivo `.cpanel.yml` copia o conteudo do repositorio para `$HOME/public_html/`.

Se o dominio estiver como addon domain, altere `DEPLOYPATH` em `.cpanel.yml` para o document root correto, por exemplo `$HOME/public_html/fitmoderno.com/`.
