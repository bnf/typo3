import { html, nothing, type TemplateResult, type PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createHeadlessForm, type Field } from '@remoteoss/json-schema-form';
import { BaseElement } from './base';

export const componentName = 'typo3-backend-settings-type-complex';

type Context = {
  name: string|number,
  jsonType: Field['jsonType'],
}[];

type FormResult = ReturnType<typeof createHeadlessForm>;
type JsfObjectSchema = Parameters<typeof createHeadlessForm>[0];

type ObjectData = { [key: string]: ObjectData } | Array<ObjectData> | string | number | null | undefined;

@customElement(componentName)
export class ComplexTypeElement extends BaseElement<object, {schema: string}> {
  @property({ type: Object }) override value: Record<string, ObjectData> = {};

  private headlessFormData: FormResult;

  protected override willUpdate(changedProperties: PropertyValueMap<this>) {
    if (this.headlessFormData === undefined || changedProperties.has('options')) {
      this.headlessFormData = createHeadlessForm(
        JSON.parse(this.options.schema) as JsfObjectSchema,
        {
          strictInputType: false
        }
      );
    }
  }

  protected override render(): TemplateResult {
    /*
    console.log(this.headlessFormData);
    console.log('get value', getValue(
      { foo:[{ rofl: 1 }, { rofl:2 }] },
      [{ name: 'foo', jsonType: 'array' },{ name: 1, jsonType:'object' }, { name:'rofl', jsonType:'number' }]
    ));

    const myObject: any = {
      //bar: 'string',
      foo:[{ rofl: 1 }, { rofl:2 }]
    };
    setValue(
      myObject,
      [{ name: 'foo', jsonType: 'array' },{ name: 1, jsonType:'object' }, { name:'rofl', jsonType:'number' }],
      'JO!',
    );
    setValue(
      myObject,
      [{ name: 'bar', jsonType: 'array' },{ name: 1, jsonType:'object' }, { name:'rofl', jsonType:'string' }],
      'JOP!',
    );
    console.log('my', myObject);
    */

    return html`${this.headlessFormData.fields.map(field => this.renderField(field, []))}`;
  }

  protected handleChange(e: Event, context: Context): void {
    const input = e.target as HTMLInputElement;
    const value = { ...this.value };
    setValue(value, context, input.value);
    this.value = value;
  }

  protected renderBasicField(field: Field, context: Context, type: string = 'text'): TemplateResult {
    return this.renderFieldMeta(field, context, html`
      <input
        type=${type}
        class="form-control"
        .value=${getValue(this.value, context)}
        ?required=${field.required}
        @change=${(e: InputEvent) => this.handleChange(e, context)}
        data-name=${field.name}
        data-context=${JSON.stringify(field.context)}
      />
    `);
  }

  protected renderFieldset(field: Field, context: Context): TemplateResult {
    const label = field.label ?? field.description ?? null;
    const description = (field.label ?? '') !== '' ? (field.description ?? null) : null;
    return html`
      <fieldset class="structuring-fieldset">
        ${label === null ? nothing : html`<legend>${label}</legend>`}
        ${description === null ? nothing : html`<p class="fieldset-description">${description}</p>`}
        ${(field.fields as Field[]).map(field => this.renderField(field, context))}
      </fieldset>
    `;
  }

  protected renderGroupArray(field: Field, context: Context): TemplateResult {
    const label = field.label ?? field.description ?? null;
    const description = (field.label ?? '') !== '' ? (field.description ?? null) : null;
    return html`
      <fieldset class="structuring-fieldset">
        ${label === null ? nothing : html`<legend>${label}</legend>`}
        ${description === null ? nothing : html`<p class="fieldset-description">${description}</p>`}
        <div>
          ${(field.fields as Field[]).map(field => this.renderField(field, [...context, { name: 0, jsonType: 'object' }]))}
        </div>
        <button class="btn btn-default" type="button" ?disabled=${this.readonly}>
          <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
        </button>
      </fieldset>
    `;
  }

  protected renderFieldMeta(field: Field, context: Context, content: TemplateResult): TemplateResult {
    const label = field.label ?? field.description ?? field.name;
    const description = (field.label ?? '') !== '' ? (field.description ?? null) : null;
    return html`
      <div class="settings-item">
        <div class="settings-item-title">
          ${label === null ? nothing : html`
            <label class="settings-item-label">
              ${label}
            </label>
          `}
          ${description === null ? nothing : html`<div class="settings-item-description">${description}</div>`}
        </div>
        <div class="settings-item-control">
          ${content}
        </div>
      </div>
    `;
  }

  protected renderField(field: Field, context: Context): TemplateResult | typeof nothing {
    if (!('inputType' in field)) {
      console.error('Missing input type', field);
      return nothing;
    }

    const { name, inputType, jsonType } = field;
    context = [
      ...context,
      { name, jsonType }
    ];

    switch (inputType) {
      case 'text': return this.renderBasicField(field, context, 'text');
      case 'number':
        console.error('TODO: implement missing type', inputType);
        return nothing;
      case 'select':
      case 'file':
      case 'radio':
        console.error('TODO: implement missing type', inputType);
        return nothing;
      case 'group-array':
        return this.renderGroupArray(field, context);
      case 'email': return this.renderBasicField(field, context, 'email');
      case 'date':
      case 'checkbox':
        console.error('TODO: implement missing type', inputType);
        return nothing;
      case 'fieldset': return this.renderFieldset(field, context);
      //case 'money':
      //case 'country':
      case 'textarea':
      case 'hidden':
        console.error('TODO: implement missing type', inputType);
        return nothing;
      default:
        throw new Error(`Unknown input type: ${inputType}`);
    }
  }
}

function getValue(object: Record<string, ObjectData>, context: Context): ObjectData {
  if (context.length === 0) {
    return object;
  }

  let pointer: ObjectData = object;
  let lastType: Field['jsonType'] = 'object';
  for (const el of context) {
    console.log(pointer);
    if (pointer === null) {
      return null;
      //throw new Error(`Missing element: ${JSON.stringify(el)} in ${JSON.stringify(pointer)}`);
    }

    if (lastType === 'object') {
      pointer = (pointer as Record<string, ObjectData>)[el.name as string] ?? null;
      lastType = el.jsonType;
    } else if (lastType === 'array') {
      pointer = (pointer as Array<ObjectData>)[el.name as number] ?? null;
      lastType = el.jsonType;
    } else {
      throw new Error(`Can not nest in desired context: ${JSON.stringify(el)} in ${JSON.stringify(pointer)}`);
    }
  }

  return pointer;
}

function setValue(object: Record<string, ObjectData>, context: Context, value: ObjectData): void {
  if (context.length === 0) {
    throw new Error('Missing context');
  }

  const target = context.pop();

  let pointer: Record<string, ObjectData> | Array<ObjectData> = object;
  let lastType: Field['jsonType'] = 'object';
  for (const { name, jsonType } of context) {
    console.log(pointer);
    if (!(jsonType === 'object' || jsonType === 'array')) {
      throw new Error('Invalid json type context');
    }
    if (lastType === 'object') {
      const objectPointer = pointer as Record<string, ObjectData>;
      const key = name as string;
      /* @todo check if current type matches jsonType */
      /*
      if (typeof objectPointer[key] !== 'object') {
        delete objectPointer[key];
      }
      */
      objectPointer[key] ??= jsonType === 'array' ? [] : {};
      pointer = objectPointer[key] as Record<string, ObjectData> | Array<ObjectData>;
    } else {
      const arrayPointer = pointer as unknown[];
      const index = name as number;
      arrayPointer[index] ??= jsonType === 'array' ? [] : {};
      pointer = arrayPointer[index] as Record<string, ObjectData> | Array<ObjectData>;
    }
    if (jsonType === 'array' && !Array.isArray(pointer)) {
      console.warn(`Pointer is not an array for ${name}`);
    }
    if (jsonType === 'object' && (typeof pointer !== 'object' || Array.isArray(pointer))) {
      console.warn(`Pointer is not an object ${name}`);
    }
    lastType = jsonType;
  }

  if (lastType === 'object') {
    const objectPointer = pointer as Record<string, ObjectData>;
    const key = target.name as string;
    objectPointer[key] = value;
  } else {
    const arrayPointer = pointer as Record<string, ObjectData>;
    const index = target.name as number;
    arrayPointer[index] = value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-type-complex': ComplexTypeElement;
  }
}
