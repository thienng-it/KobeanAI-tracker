import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSkillsStore } from '../stores/useSkillsStore';
import { ArrowLeft, Save } from 'lucide-react';

export default function SkillEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSkill, createSkill, updateSkill } = useSkillsStore();
  
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerCommand: '',
    instructions: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      getSkill(id).then(skill => {
        if (skill) {
          setFormData({
            name: skill.name || '',
            description: skill.description || '',
            triggerCommand: skill.triggerCommand || '',
            instructions: skill.instructions || ''
          });
        }
      });
    }
  }, [id, isEditing, getSkill]);

  const handleSave = async () => {
    if (!formData.name || !formData.instructions) {
      alert('Name and Instructions are required.');
      return;
    }
    
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateSkill(id, formData);
      } else {
        await createSkill(formData);
      }
      navigate('/skills');
    } catch (error) {
      console.error(error);
      alert('Failed to save skill.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--color-bg-surface-hover)',
    border: '1px solid var(--color-border-subtle)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-4)',
    fontFamily: 'inherit'
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button 
            onClick={() => navigate('/skills')}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl" style={{ margin: 0 }}>{isEditing ? 'Edit Skill' : 'Create Skill'}</h1>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ 
            background: 'var(--color-brand-primary)', 
            border: 'none', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontWeight: 500,
            opacity: isSaving ? 0.7 : 1
          }}
        >
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Skill'}
        </button>
      </header>

      <div className="glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
        
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Skill Name *</label>
        <input 
          type="text" 
          placeholder="e.g. Code Reviewer" 
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Description</label>
        <input 
          type="text" 
          placeholder="What does this skill do?" 
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          style={inputStyle}
        />
        
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Trigger Command</label>
        <input 
          type="text" 
          placeholder="e.g. /review" 
          value={formData.triggerCommand}
          onChange={e => setFormData({ ...formData, triggerCommand: e.target.value })}
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Instructions *</label>
        <textarea 
          placeholder="You are an expert code reviewer..." 
          value={formData.instructions}
          onChange={e => setFormData({ ...formData, instructions: e.target.value })}
          style={{ ...inputStyle, minHeight: '300px', resize: 'vertical' }}
        />
      </div>
    </div>
  );
}
