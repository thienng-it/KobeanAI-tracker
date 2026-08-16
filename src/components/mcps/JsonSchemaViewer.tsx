import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Copy } from 'lucide-react';

interface JsonSchemaViewerProps {
  schema: Record<string, any>;
  rootTitle?: string;
}

export const JsonSchemaViewer: React.FC<JsonSchemaViewerProps> = ({ schema, rootTitle = 'Input Parameters' }) => {
  const [copied, setCopied] = useState(false);
  const properties = schema?.properties || {};
  const requiredFields = new Set<string>(schema?.required || []);
  const type = schema?.type || 'object';

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const propertyEntries = Object.entries(properties);

  if (propertyEntries.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg-surface-active)',
        color: 'var(--color-text-tertiary)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)'
      }}>
        {schema?.description ? schema.description : 'No input parameters required for this tool.'}
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-subtle)',
      backgroundColor: 'var(--color-bg-surface-hover)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-2) var(--space-3)',
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface-active)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {rootTitle}
          </span>
          <span style={{
            fontSize: '0.6875rem',
            padding: '1px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--color-brand-primary)',
            fontFamily: 'var(--font-mono)'
          }}>
            {type} ({propertyEntries.length} {propertyEntries.length === 1 ? 'property' : 'properties'})
          </span>
        </div>

        <button
          onClick={handleCopy}
          title="Copy raw JSON Schema"
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--color-status-success-text)' : 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.6875rem',
            transition: 'color var(--duration-fast) ease'
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy Schema'}</span>
        </button>
      </div>

      {/* Property List */}
      <div style={{ padding: 'var(--space-2) 0' }}>
        {propertyEntries.map(([propName, propDef]: [string, any]) => {
          const isRequired = requiredFields.has(propName);
          return (
            <PropertyRow
              key={propName}
              name={propName}
              definition={propDef}
              isRequired={isRequired}
              depth={0}
            />
          );
        })}
      </div>
    </div>
  );
};

interface PropertyRowProps {
  name: string;
  definition: any;
  isRequired: boolean;
  depth: number;
}

const PropertyRow: React.FC<PropertyRowProps> = ({ name, definition, isRequired, depth }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const type = definition?.type || (definition?.enum ? 'enum' : 'any');
  const description = definition?.description || '';
  const hasNested = definition?.type === 'object' && definition?.properties;
  const hasArrayItems = definition?.type === 'array' && definition?.items?.properties;

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'string': return '#38bdf8'; // sky
      case 'number':
      case 'integer': return '#fbbf24'; // amber
      case 'boolean': return '#a78bfa'; // purple
      case 'array': return '#34d399'; // emerald
      case 'object': return '#f472b6'; // pink
      case 'enum': return '#f97316'; // orange
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 16 + 12}px`, paddingRight: '12px', margin: '2px 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isExpanded ? 'var(--color-bg-surface-active)' : 'transparent',
        transition: 'background-color var(--duration-fast) ease'
      }}>
        {/* Toggle arrow for nested objects */}
        {(hasNested || hasArrayItems) ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              marginTop: '3px'
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div style={{ width: '14px', flexShrink: 0 }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)'
            }}>
              {name}
            </span>

            {/* Type badge */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: getTypeColor(type),
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500
            }}>
              {type}
            </span>

            {/* Required badge */}
            {isRequired ? (
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'var(--color-status-error-text)',
                backgroundColor: 'var(--color-status-error-bg)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase'
              }}>
                Required
              </span>
            ) : (
              <span style={{
                fontSize: '0.625rem',
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '1px 4px',
                borderRadius: 'var(--radius-sm)'
              }}>
                optional
              </span>
            )}

            {/* Default value if present */}
            {definition?.default !== undefined && (
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-tertiary)'
              }}>
                default: <code style={{ color: 'var(--color-text-secondary)' }}>{JSON.stringify(definition.default)}</code>
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.4'
            }}>
              {description}
            </p>
          )}

          {/* Enums pill preview */}
          {definition?.enum && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>allowed:</span>
              {definition.enum.map((opt: string) => (
                <span
                  key={opt}
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    color: 'var(--color-brand-primary)',
                    padding: '0 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)'
                  }}
                >
                  "{opt}"
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render children for nested objects */}
      {isExpanded && hasNested && (
        <div style={{ marginTop: '2px' }}>
          {Object.entries(definition.properties).map(([nestedName, nestedDef]: [string, any]) => (
            <PropertyRow
              key={nestedName}
              name={nestedName}
              definition={nestedDef}
              isRequired={new Set(definition.required || []).has(nestedName)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {isExpanded && hasArrayItems && (
        <div style={{ marginTop: '2px' }}>
          {Object.entries(definition.items.properties).map(([nestedName, nestedDef]: [string, any]) => (
            <PropertyRow
              key={nestedName}
              name={nestedName}
              definition={nestedDef}
              isRequired={new Set(definition.items.required || []).has(nestedName)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
