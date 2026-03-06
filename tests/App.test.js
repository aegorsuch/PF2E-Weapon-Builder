// Unit test for App.vue
import { shallowMount } from '@vue/test-utils';
import App from '../src/App.vue';

describe('App.vue', () => {
  it('renders the app root', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.exists()).toBe(true);
  });

  it('shows the Clear All button', () => {
    const wrapper = shallowMount(App);
    const button = wrapper.find('button.btn-outline-danger');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Clear All');
  });

  it('renders mode toggle radios', () => {
    const wrapper = shallowMount(App);
    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios.length).toBe(3);
  });
});
