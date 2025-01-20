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
		{ name: "tags.author.id", type: "string[]", facet: true },
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
					{ id: "cool", name: "Cool :+1:", author: { id: "1", name: "Foo" } },
					{ id: "hip", name: "Hip", author: { id: "1", name: "Foo" } },
				],
			},
			{
				title: "Test 2",
				tags: [
					{ id: "cool", name: "Cool :+1:", author: { id: "1", name: "Foo" } },
					{ id: "rad", name: "Rad", author: { id: "2", name: "Bar" } },
				],
			},
		]);

	const results = await client.collections(schema.name).documents().search({
		q: "*",
		query_by: "title",
		facet_by: "tags.author.id",
		facet_return_parent: "tags.author.id",
	});

	console.dir(results, { depth: null });
}

main();
