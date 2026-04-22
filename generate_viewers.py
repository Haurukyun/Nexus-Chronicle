import os
import re

def generate_viewer_components():
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

    output_dir = 'src/components/viewer/specifics'
    os.makedirs(output_dir, exist_ok=True)

    CATEGORIES = {
        'Vital Records': ['birth', 'death', 'sex', 'age', 'height', 'weight', 'ethnicity', 'origin', 'residence', 'population', 'size', 'date', 'time', 'creation', 'end', 'type', 'speaker', 'family'],
        'Traits & Features': ['traits', 'features', 'unusual', 'personality', 'appearance', 'sentience', 'density', 'hardness', 'rarity'],
        'Stats & Knowledge': ['stats', 'power', 'combat', 'complexity', 'level', 'skills', 'spells', 'knowledge', 'education', 'complex', 'combat', 'rating'],
        'Inventory & Resources': ['items', 'resources', 'materials', 'wealth', 'currencies', 'price', 'cost', 'possesed', 'owned'],
        'Traditions & Customs': ['traditions', 'customs', 'ritual', 'culture'],
        'Governance': ['govern', 'ruled', 'headquarters', 'leader', 'authority', 'political', 'organization', 'religious', 'magic', 'science', 'tech'],
        'Interpersonal Web': ['parents', 'children', 'relatives', 'ally', 'enemy', 'complicated', 'originate', 'living', 'deceased', 'participate', 'involved'],
        'Connections': ['paired', 'related', 'connected', 'neighbour', 'member', 'belonging']
    }

    def get_category(field_name, field_label):
        label_lower = field_label.lower()
        name_lower = field_name.lower()
        if any(kw in label_lower for kw in ['govern', 'authority', 'leader', 'ideolog', 'relig', 'magic', 'science', 'tech']):
            return 'Governance'
        for cat, keywords in CATEGORIES.items():
            if any(kw in label_lower or kw in name_lower for kw in keywords):
                return cat
        return 'Connections'

    for name, fields_block in interfaces:
        # Skip Character and Location
        if name in ['Character', 'Location']:
            continue

        fields = []
        field_pattern = r'(\w+)\??: (.*?); // (.*)'
        for f_match in re.finditer(field_pattern, fields_block):
            f_name = f_match.group(1)
            f_type = f_match.group(2)
            f_label = f_match.group(3)
            if f_name == 'type' or f_name == 'spoilerNotes': continue
            fields.append({
                'name': f_name,
                'type': f_type,
                'label': f_label,
                'category': get_category(f_name, f_label)
            })

        grouped_fields = {}
        for f in fields:
            cat = f['category']
            if cat not in grouped_fields:
                grouped_fields[cat] = []
            grouped_fields[cat].append(f)

        component_content = f"""import React from 'react';
import {{ {name}, WorldEntity }} from '../../../types';
import {{ FieldRow, LinksDisplay }} from '../../ui';

interface Props {{
    entity: {name};
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}}

export const {name}SpecificsViewer: React.FC<Props> = ({{ entity, allEntities, onNavigate, isWikiMode, backlinks }}) => {{
    return (
        <div className="space-y-8">
"""
        for cat, cat_fields in grouped_fields.items():
            # Check if it's a big text block category
            if cat in ['Traits & Features', 'Traditions & Customs']:
                for f in cat_fields:
                    is_big = 'description' in f['name'].lower() or 'history' in f['name'].lower() or 'traits' in f['name'].lower() or 'features' in f['name'].lower() or 'traditions' in f['name'].lower()
                    if is_big:
                        component_content += f"""            {{entity.{f['name']} && (
                <div className={{isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}}>
                    <h3 className={{`text-2xl font-serif font-bold ${{isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'}} mb-6 tracking-tight`}}>{f['label']}</h3>
                    <p className={{`${{isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'}} whitespace-pre-wrap`}}>{{entity.{f['name']}}}</p>
                </div>
            )}}
"""
                # Handle other fields in the same category that are not big text
                other_fields = [f for f in cat_fields if not ('description' in f['name'].lower() or 'history' in f['name'].lower() or 'traits' in f['name'].lower() or 'features' in f['name'].lower() or 'traditions' in f['name'].lower())]
                if other_fields:
                    component_content += f"""            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">{cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
"""
                    for f in other_fields:
                        if 'string[]' in f['type']:
                            component_content += f"""                    <div className="col-span-full mt-2">
                        <LinksDisplay label="{f['label']}" ids={{entity.{f['name']} || []}} all={{allEntities}} onNav={{onNavigate}} isWikiMode={{isWikiMode}} />
                    </div>
"""
                        else:
                            component_content += f"""                    <FieldRow label="{f['label']}" value={{entity.{f['name']}}} isWikiMode={{isWikiMode}} />
"""
                    component_content += "                </div>\n            </div>\n"
            else:
                component_content += f"""            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">{cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
"""
                string_fields = [f for f in cat_fields if 'string[]' not in f['type'] and 'boolean' not in f['type']]
                link_fields = [f for f in cat_fields if 'string[]' in f['type']]
                
                for f in string_fields:
                    component_content += f"""                    <FieldRow label="{f['label']}" value={{entity.{f['name']}}} isWikiMode={{isWikiMode}} />
"""
                if link_fields:
                    component_content += f"""                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
"""
                    for f in link_fields:
                        component_content += f"""                        <LinksDisplay label="{f['label']}" ids={{entity.{f['name']} || []}} all={{allEntities}} onNav={{onNavigate}} isWikiMode={{isWikiMode}} />
"""
                    component_content += "                    </div>\n"
                
                component_content += "                </div>\n            </div>\n"

        component_content += """        </div>
    );
};
"""
        file_path = os.path.join(output_dir, f"{name}SpecificsViewer.tsx")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(component_content)
        print(f"Generated {file_path}")

if __name__ == "__main__":
    generate_viewer_components()
