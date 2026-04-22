import os
import re

def generate_editor_components():
    types_path = 'src/types.ts'
    with open(types_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all interfaces between GENERATED SPECIFIC INTERFACES and END SPECIFIC INTERFACES
    interfaces_match = re.search(r'// --- GENERATED SPECIFIC INTERFACES ---(.*)// --- END SPECIFIC INTERFACES ---', content, re.DOTALL)
    if not interfaces_match:
        print("Could not find generated interfaces section")
        return

    interfaces_block = interfaces_match.group(1)
    
    # Pattern to match each interface
    interface_pattern = r'export interface (\w+) extends BaseEntity \{(.*?)\}'
    interfaces = re.findall(interface_pattern, interfaces_block, re.DOTALL)

    output_dir = 'src/components/editor/specifics'
    os.makedirs(output_dir, exist_ok=True)

    # Heuristic mappings
    ICONS = {
        'Basic': 'Info',
        'Traits': 'Sparkles',
        'Details': 'Scroll',
        'Connections': 'Globe',
        'Stats': 'Zap',
        'Possessions': 'Gem',
        'Relationships': 'Heart',
        'Governance': 'Anchor',
        'Traditions': 'Tent'
    }

    CATEGORIES = {
        'Basic': ['birth', 'death', 'sex', 'age', 'height', 'weight', 'ethnicity', 'origin', 'residence', 'population', 'size', 'date', 'time', 'creation', 'end', 'type', 'speaker', 'family'],
        'Traits': ['traits', 'features', 'unusual', 'personality', 'appearance', 'sentience', 'density', 'hardness', 'rarity'],
        'Stats': ['stats', 'power', 'combat', 'complexity', 'level', 'skills', 'spells', 'knowledge', 'education', 'complex', 'combat', 'rating'],
        'Possessions': ['items', 'resources', 'materials', 'wealth', 'currencies', 'price', 'cost', 'possesed', 'owned'],
        'Traditions': ['traditions', 'customs', 'ritual', 'culture'],
        'Connections': ['paired', 'related', 'connected', 'neighbour', 'member', 'ally', 'enemy', 'belonging', 'originate', 'living', 'deceased', 'participate', 'involved'],
        'Details': ['description', 'history', 'notes', 'text', 'free-form', 'spoilers', 'secrets'],
        'Governance': ['govern', 'ruled', 'headquarters', 'leader', 'authority', 'political', 'organization', 'religious', 'magic', 'science', 'tech']
    }

    def get_category(field_name, field_label):
        label_lower = field_label.lower()
        name_lower = field_name.lower()
        
        # Priority for Governance
        if any(kw in label_lower for kw in ['govern', 'authority', 'leader', 'ideolog', 'relig', 'magic', 'science', 'tech']):
            return 'Governance'
        
        for cat, keywords in CATEGORIES.items():
            if any(kw in label_lower or kw in name_lower for kw in keywords):
                return cat
        return 'Details'

    for name, fields_block in interfaces:
        # Skip Character and Location as they are already handled manually
        if name in ['Character', 'Location']:
            continue

        fields = []
        # Pattern to match fields like: fieldName?: string[]; // Label
        field_pattern = r'(\w+)\??: (.*?); // (.*)'
        for f_match in re.finditer(field_pattern, fields_block):
            f_name = f_match.group(1)
            f_type = f_match.group(2)
            f_label = f_match.group(3)
            
            if f_name == 'type': continue
            
            fields.append({
                'name': f_name,
                'type': f_type,
                'label': f_label,
                'category': get_category(f_name, f_label)
            })

        # Group fields by category
        grouped_fields = {}
        for f in fields:
            cat = f['category']
            if cat not in grouped_fields:
                grouped_fields[cat] = []
            grouped_fields[cat].append(f)

        # Generate Component
        import_icons = set()
        for cat in grouped_fields:
            import_icons.add(ICONS.get(cat, 'FileText'))

        # Check if we need GroupRoleGroup (heuristic: fields ending in Leaders/Group)
        uses_group_role = any('Leaders' in f['name'] or 'Group' in f['name'] for f in fields)
        group_role_import = "import { GroupRoleGroup } from '../GroupRoleGroup';" if uses_group_role else ""

        component_content = f"""import React from 'react';
import {{ {name}, WorldEntity, EntityType }} from '../../../types';
import {{ FormInput, SmartSelect, FormToggle }} from '../../ui';
import {{ EditorGroup }} from '../EditorGroup';
{group_role_import}
import {{ {', '.join(sorted(list(import_icons)))} }} from 'lucide-react';

interface Props {{
    entity: {name};
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<{name}>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}}

export const {name}Specifics: React.FC<Props> = ({{ entity, allEntities, onUpdate, onCreateNew, isWikiMode }}) => {{
    return (
        <>
"""
        for cat, cat_fields in grouped_fields.items():
            icon = ICONS.get(cat, 'FileText')
            component_content += f"""            <EditorGroup title="{cat}" icon={{{icon}}} isWikiMode={{isWikiMode}}>
"""
            for f in cat_fields:
                is_textarea = 'description' in f['name'].lower() or 'history' in f['name'].lower() or 'traits' in f['name'].lower() or 'features' in f['name'].lower() or 'notes' in f['name'].lower() or 'traditions' in f['name'].lower()
                
                if 'string[]' in f['type']:
                    # Heuristic for EntityType in SmartSelect
                    target_type = 'character' # Default
                    label_lower = f['label'].lower()
                    if 'location' in label_lower or 'place' in label_lower: target_type = 'location'
                    elif 'item' in label_lower: target_type = 'item'
                    elif 'myth' in label_lower or 'legend' in label_lower: target_type = 'myth'
                    elif 'lore' in label_lower or 'note' in label_lower: target_type = 'note'
                    elif 'event' in label_lower: target_type = 'event'
                    elif 'species' in label_lower or 'race' in label_lower or 'flora' in label_lower: target_type = 'species'
                    elif 'language' in label_lower: target_type = 'language'
                    elif 'culture' in label_lower: target_type = 'culture'
                    elif 'politic' in label_lower or 'ideolog' in label_lower: target_type = 'political'
                    elif 'relig' in label_lower: target_type = 'religious'
                    elif 'organization' in label_lower: target_type = 'organization'
                    elif 'magic' in label_lower: target_type = 'magic'
                    elif 'tech' in label_lower or 'science' in label_lower: target_type = 'tech'
                    elif 'skill' in label_lower or 'spell' in label_lower or 'ability' in label_lower: target_type = 'ability'
                    elif 'occupation' in label_lower or 'class' in label_lower: target_type = 'occupation'
                    elif 'condition' in label_lower or 'affliction' in label_lower or 'boon' in label_lower: target_type = 'condition'
                    elif 'resource' in label_lower or 'material' in label_lower: target_type = 'resource'
                    
                    component_content += f"""                <SmartSelect label="{f['label']}" ids={{entity.{f['name']} || []}} type="{target_type}" all={{allEntities}} isWikiMode={{isWikiMode}} onChange={{(ids) => onUpdate({{ ...entity, {f['name']}: ids }})}} onCreate={{onCreateNew}} />
"""
                elif is_textarea:
                    component_content += f"""                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">{f['label']}</label>
                    <textarea className={{`w-full ${{isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'}} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`}} value={{entity.{f['name']} || ''}} onChange={{e => onUpdate({{ ...entity, {f['name']}: e.target.value }})}} />
                </div>
"""
                elif 'boolean' in f['type']:
                    component_content += f"""                <FormToggle label="{f['label']}" checked={{entity.{f['name']} || false}} onChange={{(v) => onUpdate({{ ...entity, {f['name']}: v }})}} isWikiMode={{isWikiMode}} />
"""
                else:
                    component_content += f"""                <FormInput label="{f['label']}" value={{entity.{f['name']} || ""}} onChange={{(v: string) => onUpdate({{ ...entity, {f['name']}: v }})}} isWikiMode={{isWikiMode}} />
"""
            component_content += "            </EditorGroup>\n"
        
        component_content += """        </>
    );
};
"""
        file_path = os.path.join(output_dir, f"{name}Specifics.tsx")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(component_content)
        print(f"Generated {file_path}")

if __name__ == "__main__":
    generate_editor_components()
