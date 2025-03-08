export const parseFilterParams = ({ isFavourite, contactType }) => {
  const filters = {};
  if (contactType) {
    filters.contactType = contactType;
  }
  if (typeof isFavourite !== 'undefined') {
    filters.isFavourite = isFavourite === 'true';
  }

  return filters;
};
