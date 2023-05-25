let sections = [];

function getGroup(name) {
    const index = name.lastIndexOf('[');
    if (index === -1 || !name.endsWith(']')) return null;
    return name.substring(index + 1, name.length - 1);
}

fetch(`/api/v1/courses/${ENV.course_id}/sections`).then(c => c.json()).then(c => {
    sections = c;
    const sectionFilter = $(`<select>
      <option>Show all sections</option>
      ${sections.map(s => `<option value=${s.id}>${s.name}</option>`)}
    </select>`)[0];
    $('div.header-bar').append(sectionFilter);

    function updateModules() {
        const modules = document.querySelectorAll('div.context_module');
        for (const mod of modules) {
            const name = mod.attributes["aria-label"].value;
            if (!name) continue;
            const group = getGroup(name);
            mod.style.display = sectionFilter.selectedIndex === 0
                || !group
                || group === sections[sectionFilter.selectedIndex - 1].name
                    ? 'block' : 'none';
        }
    }

    sectionFilter.addEventListener('change', updateModules);

    fetch(`/api/v1/courses/${ENV.course_id}/enrollments?user_id=${ENV.current_user_id}`)
        .then(c => c.json())
        .then(c => {
           const secId = c[0].course_section_id;
           const index = sections.findIndex(s => s.id === secId);
           if (index >= 0) {
               sectionFilter.selectedIndex = index + 1;
               updateModules();
           }
        });
});

let sectionSelect = null;

const links = document.querySelectorAll('.edit_module_link,.add_module_link');
for (const link of links) {
    link.addEventListener('click', () => {
        const nameBox = document.querySelector('#context_module_name');
        if (!sectionSelect) {
            sectionSelect = $(`<select>
              <option>All sections</option>
              ${sections.map(s => `<option value=${s.id}>${s.name}</option>`)}
            </select>`)[0];
            $('div.module_name')
                .append(`<div style='margin-top: 10px'><label>Section:</label> </div>`)
                .append(sectionSelect);

            sectionSelect.addEventListener('change', () => {
                const part = getGroup(nameBox.value) ? nameBox.value.substring(0, nameBox.value.lastIndexOf('[')).trim() : nameBox.value;
                nameBox.value = sectionSelect.selectedIndex === 0 ? part : `${part} [${sections[sectionSelect.selectedIndex - 1].name}]`;
            });
        }

        setTimeout(() => {
            sectionSelect.selectedIndex = 0;
            const group = getGroup(nameBox.value);
            if (group) {
                const section = sections.findIndex(z => z.name === group);
                if (section >= 0) {
                    sectionSelect.selectedIndex = section + 1;
                }
            }
        }, 10);
    })
}