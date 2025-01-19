import { Client } from "typesense";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

const client = new Client({
	apiKey: "xyz123",
	nodes: [
		{
			host: "localhost",
			port: 8108,
			protocol: "http",
		},
	],
});

const schema: CollectionCreateSchema = {
	name: "test",
	fields: [
		{ name: "title", type: "string", sort: true },
		{ name: "tags.id", type: "string[]", facet: true },
	],
	default_sorting_field: "title",
	enable_nested_fields: true,
};

async function main() {
	await client
		.collections(schema.name)
		.delete()
		.catch(() => {});
	await client.collections().create(schema);
	await client
		.collections(schema.name)
		.documents()
		.import([
			{
				title: "Test 1",
				tags: [
					{ id: "cool", name: "Cool :+1:" },
					{ id: "hip", name: "Hip" },
				],
			},
			{
				title: "Test 2",
				tags: [
					{ id: "cool", name: "Cool :+1:" },
					{ id: "rad", name: "Rad" },
				],
			},
		]);

	const results = await client.collections(schema.name).documents().search({
		q: "*",
		query_by: "title",
		facet_by: "tags.id",
		facet_return_parent: "tags.id",
	});

	console.dir(results, { depth: null });
}

main();
