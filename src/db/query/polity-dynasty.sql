select p.name, d.name from dynasty_polity_links dpl
inner join polities p on p.id = dpl.polity_id
inner join dynasties d on d.id = dpl.dynasty_id
order by p.id, d.id;