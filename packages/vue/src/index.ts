import type { App } from 'vue';

import SignInForm from './SignInForm.vue';

const Components = {
  SignInForm,
  install: (app: App) => {
    Object.entries(Components).forEach(([name, c]) => {
      app.component(name, c);
    });
  },
};

export { Components };
// export default Components;
