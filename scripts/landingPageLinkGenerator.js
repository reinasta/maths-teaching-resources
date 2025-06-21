export function generateLandingPageLink(entry) {
  const { componentName, description } = entry;
  const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const displayName = componentName.replace(/([A-Z])/g, ' $1').trim();
  return `<Link
  href="/components/standalone/${kebabName}"
  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
>
  <h3 className="text-xl font-medium text-gray-900 mb-2">${displayName}</h3>
  <p className="text-gray-600 leading-relaxed">
    ${description}
  </p>
</Link>`;
}
