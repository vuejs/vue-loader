# Hot Reload

"Hot Reload" \(Recarga Automática\) não é simplesmente recarregar a página quando você editar um arquivo. Com hot reload ativado, quando você edita um arquivo `*.vue`, todas as instâncias desse componente serão trocadas **sem recarregar a página**. Ele ainda preserva o estado atual de sua aplicação e dos componentes trocados. Isto melhora drasticamente a experiência de desenvolvimento quando você está ajustando os modelos ou estilo de seus componentes.

![hot-reload](http://blog.evanyou.me/images/vue-hot.gif)

Quando o esqueleto do projeto é criado com `vue-cli`, Hot Reload é ativado e proto para o uso.