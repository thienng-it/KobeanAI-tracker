import React, { useState, useEffect } from 'react';
import { Plugin, usePluginStore, PluginDetailResponse, BundledSkillDetail, PluginFileNode } from '../../stores/usePluginStore';
import { 
  X, 
  Puzzle, 
  BrainCircuit, 
  FileCode2, 
  FolderTree, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen,
  Folder,
  File,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface PluginInspectorModalProps {
  plugin: Plugin;
  onClose: () => void;
}

export const PluginInspectorModal: React.FC<PluginInspectorModalProps> = ({
  plugin,
  onClose
}) => {
  const { getPluginDetail } = usePluginStore();
  const [detail, setDetail] = useState<PluginDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'manifest' | 'files'>('overview');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<BundledSkillDetail | null>(null);

  useEffect(() => {
    getPluginDetail(plugin.id).then(res => {
      setDetail(res);
      if (res?.bundledSkills && res.bundledSkills.length > 0) {
        setSelectedSkill(res.bundledSkills[0]);
      }
      setIsLoading(false);
    });
  }, [plugin.id, getPluginDetail]);

  const handleCopyManifest = () => {
    if (detail?.rawManifest) {
      navigator.clipboard.writeText(detail.rawManifest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWorkspace = plugin.scope === 'workspace';

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--duration-fast) ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '85vh',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border-subtle)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isWorkspace ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: isWorkspace ? '#a78bfa' : 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Puzzle size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {plugin.name}
                </h2>

                <span style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-bg-surface-active)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  v{plugin.version}
                </span>

                <span style={{
                  fontSize: '0.6875rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isWorkspace ? 'rgba(139, 92, 246, 0.12)' : 'var(--color-bg-surface-active)',
                  color: isWorkspace ? '#c4b5fd' : 'var(--color-text-tertiary)',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {plugin.scope}
                </span>
              </div>

              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {plugin.description || 'AI agent plugin bundle'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '0 var(--space-6)',
          gap: '4px'
        }}>
          {[
            { id: 'overview', name: 'Overview & README', icon: <BookOpen size={14} /> },
            { id: 'skills', name: `Bundled Skills (${detail?.bundledSkills.length ?? plugin.skillsCount})`, icon: <BrainCircuit size={14} /> },
            { id: 'manifest', name: 'plugin.json', icon: <FileCode2 size={14} /> },
            { id: 'files', name: 'Files Tree', icon: <FolderTree size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--duration-fast) ease'
              }}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
              Loading plugin details...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {/* Meta cards row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      border: '1px solid var(--color-border-subtle)'
                    }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>Author</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                        {plugin.author || 'Community'}
                      </div>
                    </div>

                    <div style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      border: '1px solid var(--color-border-subtle)'
                    }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>License</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                        {plugin.license || 'MIT'}
                      </div>
                    </div>

                    <div style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-bg-surface-hover)',
                      border: '1px solid var(--color-border-subtle)'
                    }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>Location</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {plugin.path || 'Local filesystem'}
                      </div>
                    </div>

                    {plugin.repository && (
                      <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-bg-surface-hover)',
                        border: '1px solid var(--color-border-subtle)'
                      }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>Repository</div>
                        <a
                          href={plugin.repository}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--color-brand-primary)',
                            marginTop: '2px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none'
                          }}
                        >
                          <span>View on GitHub</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* README View */}
                  <div style={{
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-app)',
                    padding: 'var(--space-5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-3)', color: 'var(--color-text-tertiary)' }}>
                      <FileText size={15} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>README.md</span>
                    </div>

                    {detail?.plugin?.readme ? (
                      <pre style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        color: 'var(--color-text-primary)'
                      }}>
                        {detail.plugin.readme}
                      </pre>
                    ) : (
                      <p style={{ margin: 0, color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                        No README.md documentation provided with this plugin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: BUNDLED SKILLS */}
              {activeTab === 'skills' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-4)', height: '100%' }}>
                  {/* Skills List */}
                  <div style={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-surface-hover)',
                    overflowY: 'auto',
                    padding: 'var(--space-2)'
                  }}>
                    {detail?.bundledSkills && detail.bundledSkills.length > 0 ? (
                      detail.bundledSkills.map(skill => (
                        <div
                          key={skill.slug}
                          onClick={() => setSelectedSkill(skill)}
                          style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: selectedSkill?.slug === skill.slug ? 'var(--color-bg-surface-active)' : 'transparent',
                            border: selectedSkill?.slug === skill.slug ? '1px solid var(--color-brand-primary)' : '1px solid transparent',
                            cursor: 'pointer',
                            marginBottom: '4px',
                            transition: 'all var(--duration-fast) ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BrainCircuit size={14} color={selectedSkill?.slug === skill.slug ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)'} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {skill.name}
                            </span>
                          </div>

                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '0.6875rem',
                            color: 'var(--color-text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {skill.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-tertiary)', fontSize: '0.8125rem', textAlign: 'center' }}>
                        No skills bundled in this plugin.
                      </div>
                    )}
                  </div>

                  {/* Skill Prompt & Instructions Preview */}
                  <div style={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-app)',
                    padding: 'var(--space-4)',
                    overflowY: 'auto'
                  }}>
                    {selectedSkill ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {selectedSkill.name}
                            </h3>
                            <code style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
                              {selectedSkill.path}
                            </code>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                          {selectedSkill.description}
                        </p>

                        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          SKILL.md Instructions Preview:
                        </div>

                        <pre style={{
                          margin: 0,
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-surface)',
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#38bdf8',
                          lineHeight: '1.5',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {selectedSkill.instructionsPreview}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
                        Select a skill from the list to preview its instructions.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MANIFEST (plugin.json) */}
              {activeTab === 'manifest' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Raw JSON manifest file (`plugin.json`):
                    </span>

                    <button
                      onClick={handleCopyManifest}
                      className="btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      {copied ? <Check size={12} color="var(--color-status-success-text)" /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <pre style={{
                    margin: 0,
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-app)',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#38bdf8',
                    lineHeight: '1.5',
                    overflowX: 'auto',
                    maxHeight: '440px'
                  }}>
                    {detail?.rawManifest || '{}'}
                  </pre>
                </div>
              )}

              {/* TAB 4: FILE TREE */}
              {activeTab === 'files' && (
                <div style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-app)',
                  padding: 'var(--space-4)',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                    Plugin File Structure:
                  </div>

                  {detail?.fileTree ? (
                    <FileTreeRenderer node={detail.fileTree} />
                  ) : (
                    <div style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                      No file tree available.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Recursive file tree viewer component
const FileTreeRenderer: React.FC<{ node: PluginFileNode; level?: number }> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isDirectory = node.type === 'directory';

  return (
    <div style={{ marginLeft: `${level * 16}px`, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
      <div 
        onClick={() => isDirectory && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 6px',
          borderRadius: 'var(--radius-sm)',
          cursor: isDirectory ? 'pointer' : 'default',
          color: isDirectory ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
          userSelect: 'none'
        }}
      >
        {isDirectory ? (
          isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <span style={{ width: '14px' }} />
        )}

        {isDirectory ? <Folder size={14} /> : <File size={14} />}
        <span>{node.name}</span>

        {node.sizeBytes !== undefined && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
            {node.sizeBytes < 1024 ? `${node.sizeBytes} B` : `${(node.sizeBytes / 1024).toFixed(1)} KB`}
          </span>
        )}
      </div>

      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child: PluginFileNode, idx: number) => (
            <FileTreeRenderer key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
