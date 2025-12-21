/**
 * 组件注册表
 * 管理所有可用的基础组件
 */

import { Component, ComponentPublicInstance } from 'vue';
import { ComponentName, ComponentDefinition } from './types';

export class ComponentRegistry {
  private static components = new Map<ComponentName, Component>();
  private static definitions = new Map<ComponentName, ComponentDefinition>();

  /**
   * 注册组件
   */
  static register(name: ComponentName, component: Component, definition?: ComponentDefinition): void {
    this.components.set(name, component);
    if (definition) {
      this.definitions.set(name, definition);
    }
  }

  /**
   * 获取组件
   */
  static get(name: ComponentName): Component | undefined {
    return this.components.get(name);
  }

  /**
   * 获取组件定义
   */
  static getDefinition(name: ComponentName): ComponentDefinition | undefined {
    return this.definitions.get(name);
  }

  /**
   * 检查组件是否存在
   */
  static has(name: ComponentName): boolean {
    return this.components.has(name);
  }

  /**
   * 获取所有已注册的组件名称
   */
  static getAllNames(): ComponentName[] {
    return Array.from(this.components.keys());
  }

  /**
   * 获取所有组件定义
   */
  static getAllDefinitions(): Map<ComponentName, ComponentDefinition> {
    return new Map(this.definitions);
  }
}


