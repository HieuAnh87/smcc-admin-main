import classNames from "classnames";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useState, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { createProfile, getAllProfiles, updateProfile } from "../../service/profileAPI";
import { createSource, updateSource } from "../../service/sourceAPI";
import { createTag, getAllTags, getAllCate } from "../../service/tagAPI";
import Select from 'react-select';
import axios from "axios";
import { createHistory } from "../../service/historyAPI";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from 'primereact/multiselect';
import { useSelector } from "react-redux";

Form.propTypes = {};

function Form({ btnText, data, toast, closeDialog }) {
  const optionQuesntions = [
    {
      label: "Văn bản",
      value: "PARAGRAPH",
    },
    {
      label: "Chọn nhiều",
      value: "CHECKBOXES",
    },
    {
      label: "Nhiều lựa chọn",
      value: "MULTIPLE_CHOICE",
    },
  ];
  const formatInfo = (label) => {
    if (label == "PARAGRAPH") return "Văn bản"
    else if (label == "CHECKBOXES") return "Câu trả lời 1 lựa chọn"
  }
  const defaultValues = {
    links: btnText == "Edit" ? data.link : "",
    tagIds:
      data?.tagsInfo?.map((p) => ({
        label: p.name,
        value: p.id,
      })) || [],
    profileIds:
      data?.profilesInfo?.map((p) => ({
        label: p.name,
        value: p.id,
      })) || [],
    categoryId: data?.categoryId,
    link: data?.link || "",
    name: data?.name || "",
    type: data?.type || "",
    status: data?.status || "",
    questionsToJoin:
      data?.questionsToJoin?.map((question, i) => {
        let newAnswer;
        let selected_options = []
        let question_options = []
        if (question.question_type == "PARAGRAPH") {
          newAnswer = question.answer;
        } else if (question.question_type == "CHECKBOXES") {
          selected_options = question.selected_options
          question_options = question.question_options
        } else {
          selected_options = question.selected_options ? question.selected_options[0] : ""
          question_options = question.question_options
        }
        return {
          ...question,
          question_type: question.question_type,
          question: question.question,
          selected_options: selected_options,
          question_options: question_options,
          answer: question.question_type == "PARAGRAPH" ? newAnswer : ""
        };

      }) || [],
  };
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
  } = useForm({ defaultValues });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionsToJoin",
  });
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState("");

  const [filterTags, setFilterTags] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [keywordsProfile, setKeywordsProfile] = useState("");
  const [filterProfiles, setFilterProfiles] = useState(null);
  const token = useSelector((state) => state.user.token);
  const userId = useSelector((state) => state.user?.userData?.id || "");
  const formatCreate = (data) => {
    return {
      links: data.links,
      tagIds: data.tagIds,
      profileIds: data.profileIds,
      categoryId: data.categoryId
      // questionsToJoin: data?.questionsToJoin,
    };
  };
  const handleError = (err) => {
    if (err?.response?.data?.msg) {
      toast.current.show({ severity: "error", summary: err.response.data.msg, detail: "Lỗi" });
      throw new Error(err.response.data.msg);
    } else if (err?.message) {
      toast.current.show({ severity: "error", summary: err.message, detail: "Lỗi" });
      throw new Error(err.message);
    } else {
      toast.current.show({ severity: "error", summary: err, detail: "Lỗi" });
    }
  };
  const addHistory = useMutation(createHistory, {
    onError: (e) => {
      console.log(e);
    },
  });
  const key = `${process.env.REACT_APP_API_URL}/tag?page=1&pageSize=12&name=${keywords}`;
  const tags = useQuery(key, (query) => getAllTags(query, token), {
    onSuccess: (data) => {
      setFilterTags([
        ...data?.docs.map((p) => ({
          value: p.id,
          label: p.name,
        })),
      ]);
    },
  });

  const keyCategory = `${process.env.REACT_APP_API_URL}/category`;
  const categoriesQuery = useQuery(keyCategory, (query) => getAllCate(query, token), {
    onSuccess: (data) => {
      setFilterCategory([
        ...data?.doc.map((p) => ({
          value: p.id,
          label: p.name,
        })),
      ]);
    },
  });

  const keyProfile = `${process.env.REACT_APP_API_URL}/profile?page=1&pageSize=12&name=${keywordsProfile}`;
  const profiles = useQuery(keyProfile, (query) => getAllProfiles(query, token), {
    onSuccess: (data) => {
      setFilterProfiles([
        ...data?.docs.map((p) => ({
          value: p.id,
          label: p.name,
        })),
      ]);
    },
  });

  const createTagFromSource = useMutation(createTag, {
    onError: (error) => handleError(error),
    onSuccess: (data) => {
      const name = data?.doc && data?.doc[0] && data?.doc[0]?.name;
      const id = data?.doc && data?.doc[0] && data?.doc[0]?.id;
      const cloneTagIds = getValues().tagIds.map((p, i) => {
        if (p.label == name) {
          return {
            label: name,
            value: id,
          };
        }
        return p;
      });
      addHistory.mutate({ newData: { screen: "Nguồn dữ liệu", description: "Tạo tag từ form nguồn dữ liệu" }, token });

      setValue("tagIds", cloneTagIds);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/tag`);
        },
      });
    },
  });
  const createProfileFromSource = useMutation(createProfile, {
    onError: (error) => handleError(error),
    onSuccess: (data) => {
      const name = data?.doc && data?.doc[0] && data?.doc[0]?.name;
      const id = data?.doc && data?.doc[0] && data?.doc[0]?.id;
      const cloneProfileIds = getValues().profileIds.map((p, i) => {
        if (p.label == name) {
          return {
            label: name,
            value: id,
          };
        }
        return p;
      });
      addHistory.mutate({ newData: { screen: "Nguồn dữ liệu", description: "Tạo profile từ form nguồn dữ liệu" }, token });

      setValue("profileIds", cloneProfileIds);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/profile`);
        },
      });
    },
  });
  const updateProfileFromSource = useMutation(updateProfile, {
    onError: (error) => handleError(error),
  });
  const create = useMutation(createSource, {
    onSuccess: (data) => {
      if (data?.doc?.success?.length > 0 && data?.doc?.fail?.length > 0) {
        toast.current.show({
          severity: "warn",
          summary: (
            <span>
              Tạo Source thành công: <br />{" "}
              {data?.doc?.success.map((p) => (
                <span>
                  {p} <br />
                </span>
              ))}{" "}
              <br /> Tạo source thất bại:{" "}
              {data?.doc?.fail.map((p) => (
                <span>
                  {p} <br />
                </span>
              ))}
              `
            </span>
          ),
          detail: "Thành công",
        });
      } else if (data?.doc?.success?.length > 0 && data?.doc?.fail?.length == 0) {
        toast.current.show({ severity: "success", summary: <span>Tạo nguồn dữ liệu thành công</span>, detail: "Thành công", life: 5000 });
      } else {
        toast.current.show({ severity: "error", summary: "Tạo nguồn dữ liệu thất bại", detail: "Thất bại" });
      }
      addHistory.mutate({ newData: { screen: "Nguồn dữ liệu", description: "Tạo nguồn dữ liệu" }, token });
    },
    onError: (error) => handleError(error),
    onSettled: () => {
      closeDialog();
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/source`);
        },
      });
    },
  });

  const update = useMutation(updateSource, {
    onSuccess: (updateData) => {
      toast.current.show({ severity: "success", summary: "Cập nhật nguồn dữ liệu thành công", detail: "Thành công" });
      addHistory.mutate({
        newData: {
          screen: `Nguồn dữ liệu", description: "Cập nhật nguồn dữ liệu id: ${updateData?.doc[0]?.id} từ: {name: ${data?.name}, link: ${data?.link}, profileids: [${data?.profileIds?.join(", ") || ""}], tagids: [${data?.tagIds?.join(", ") || ""}]} sang: { name: ${updateData?.doc[0]?.name}, link: ${updateData?.doc[0]?.link
            }, profileids: [${updateData?.doc[0]?.profileIds.join(", ") || ""}], tagids: [${updateData?.doc[0]?.tagIds.join(", ") || ""}] }`,
        },
        token,
      });
    },
    onError: (error) => handleError(error),
    onSettled: () => {
      closeDialog();
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/source`);
        },
      });
    },
  });
  const removeSourceFromProfile = async (idSource, idProfile) => {
    const detailProfile = await axios.get(`${process.env.REACT_APP_API_URL}/profile/${idProfile}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    let sourceIds = detailProfile.data.doc.sourceIds || [];
    let authorIds = detailProfile.data.doc.authorIds || [];
    let contentIds = detailProfile.data.doc.contentIds || [];
    let name = detailProfile.data.doc.name;
    let description = detailProfile.data.doc.description;

    if (sourceIds && sourceIds.length) {
      sourceIds = sourceIds.filter((p) => p != idSource);
    }
    updateProfileFromSource.mutate({ id: idProfile, newData: { sourceIds, authorIds, contentIds, name, description }, token });
  };
  const addSourceFromProfile = async (idSource, idProfile) => {
    const detailProfile = await axios.get(`${process.env.REACT_APP_API_URL}/profile/${idProfile}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    let sourceIds = detailProfile.data.doc.sourceIds || [];
    let authorIds = detailProfile.data.doc.authorIds || [];
    let contentIds = detailProfile.data.doc.contentIds || [];
    let name = detailProfile.data.doc.name;
    let description = detailProfile.data.doc.description;

    sourceIds.push(idSource);
    updateProfileFromSource.mutate({ id: idProfile, newData: { sourceIds, authorIds, contentIds, name, description }, token });
  };
  const onSubmit = async (newData) => {

    let addProfiles = [];
    let removeProfiles = [];
    const oldProfiles = data?.profileIds || [];
    let newProfiles = newData.profileIds.map((p) => p.value);
    for (let item of oldProfiles) {
      if (!newProfiles.find((p) => p == item)) {
        removeProfiles.push(item);
      }
    }
    for (let item of newProfiles) {
      if (!oldProfiles.find((p) => p == item)) {
        addProfiles.push(item);
      }
    }
    const formatQuestion =
      newData.questionsToJoin?.map((question, i) => {
        if (question.question_type == "MULTIPLE_CHOICE") {
          question.selected_options = [question.selected_options];
        }
        return {
          ...question,
        };
      }) || [];
    newData.questionsToJoin = formatQuestion;
    newData.categoryId = category
    console.log(newData);
    if (btnText == "Edit") {
      update.mutate({ id: data.id, newData: { tagIds: newData.tagIds.map((p) => p.value), categoryId: newData.categoryId, profileIds: newData.profileIds.map((p) => p.value), questionsToJoin: newData.questionsToJoin, type: newData?.type }, token });
      for (let item of removeProfiles) {
        removeSourceFromProfile(data?.id, item);
      }
      for (let item of addProfiles) {
        addSourceFromProfile(data?.id, item);
      }
    } else {
      create.mutate({ newData: formatCreate(newData), token });
    }
  };
  const searchTags = (event) => {
    let timeout;
    let query = event.query;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setKeywords(query);
    }, 300);
  };
  const searchCategory = (event) => {
    let timeout;
    let query = event.query;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setCategory(query);
    }, 300);
  };
  const enterNoExit = async (e) => {
    if (e.charCode == 13 && filterTags.length == 0 && e.target.value.trim()) {
      setValue("tagIds", [
        ...getValues().tagIds,
        {
          label: e.target.value,
          value: e.target.value,
        },
      ]);
      createTagFromSource.mutate({ newData: { name: e.target.value }, token });
      e.target.value = "";
    }
  };
  const searchProfiles = (event) => {
    let timeout;
    let query = event.query;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      setKeywordsProfile(query);
    }, 300);
  };
  const enterNoExitProfiles = async (e) => {
    if (e.charCode == 13 && filterProfiles.length == 0 && e.target.value.trim()) {
      setValue("profileIds", [
        ...getValues().profileIds,
        {
          label: e.target.value,
          value: e.target.value,
        },
      ]);
      createProfileFromSource.mutate({ newData: { name: e.target.value }, token });
      e.target.value = "";
    }
  };
  //   const update = useMutation(updateSource, {
  //     onSuccess: () => {
  //       toast.current.show({ severity: "success", summary: "Update Post Thành công", detail: "Thành công" });
  //     },
  //     onError: (error) => {
  //       handleError(error);
  //     },
  //     onSettled: () => {
  //       closeDialog();
  //       return queryClient.invalidateQueries({
  //         predicate: (query) => {
  //           return query.queryKey.startsWith(`${process.env.REACT_APP_API_URL}/topic`);
  //         },
  //       });
  //     },
  //   });
  const selectProfile = async (e) => { };
  const unSelectProfile = async (e) => { };
  const getFormErrorMessage = (name) => {
    return errors[name] && <small className="p-error">{errors[name].message}</small>;
  };
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // Replace this with your actual API call
    fetch(`${process.env.REACT_APP_API_URL}/category`)
      .then(response => response.json())
      .then(data => setCategories(data.doc))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const handleNameChange = (e) => {
    setName(e.target.value);
  }
  const handlegetAllCategory = async () => {
    axios.get(`${process.env.REACT_APP_API_URL}/category`).then(data => {
      setCategories(data.doc)
    }
    ).catch(error => console.error('Error fetching data:', error));
  }
  const handleSubmitCategory = async (e) => {

    if (name == '') return;
    // Make a POST request to your API with the entered name
    const req = {
      name: name
    }
    await axios.post(`${process.env.REACT_APP_API_URL}/category`, req)
      .then(data => {
        // Handle the response from the API as needed
        console.log('API Response:', data);
      })
      .catch(error => console.error('Error posting data:', error));
    fetch(`${process.env.REACT_APP_API_URL}/category`)
      .then(response => response.json())
      .then(data => setCategories(data.doc))
      .catch(error => console.error('Error fetching data:', error));
    e.preventDefault();

  }
  const handleCategoryChange = (e) => {
    setCategory(e?.target?.value);
  }
  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setCategory(selectedOption?.value);
    setName(selectedOption?.label)
  };
  console.log(category)
  console.log(selectedOption)
  console.log(categories)
  const handleInputChange = (inputValue, actionMeta) => {
    if (actionMeta.action === 'input-change') {
      setName(inputValue);
    }
  };

  const customNoOptionsMessage = () => {
    return (
      <Button type='button' onClick={handleSubmitCategory}>Thêm danh mục</Button>
    )

  };

  const handleRemoveSelectedOption = async (e) => {
    e.preventDefault()
    await axios.delete(`${process.env.REACT_APP_API_URL}/category/${selectedOption.value}`).then().catch(error => console.error('Error fetching data:', error));
    setSelectedOption(null);
    await fetch(`${process.env.REACT_APP_API_URL}/category`)
      .then(response => response.json())
      .then(data => setCategories(data.doc))
      .catch(error => console.error('Error fetching data:', error));

    // Make an API call here to delete the selected option using option.value
  };
  const CustomOption = (props) => {
    const [resCode, setResCode] = useState(200);
    const handleDeleteOption = async (e) => {
      e.preventDefault();
      const optionValue = props.data.value;

      // Make an API call to delete the option using optionValue
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/category/${optionValue}`).then(data => setResCode(parseInt(data?.code))).catch(error => console.error('Error fetching data:', error));
        // Update the local state to reflect the changes
        setSelectedOption(null);

        // Fetch the updated list of categories
        await fetch(`${process.env.REACT_APP_API_URL}/category`)
          .then(response => response.json())
          .then(data => setCategories(data.doc))
          .catch(error => console.error('Error fetching data:', error));
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    };
    if (resCode === 404) {
      return
    }
    return (
      <div className="custom-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px' }}>
        <span>{props.label}</span>
        <button className="delete-button" style={{
          backgroundColor: '#6366f1', /* Change to your preferred button style */
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
          onClick={handleDeleteOption}>
          Xoá danh mục
        </button>
      </div>
    );
  };



  console.log("selected Option:     ", selectedOption)
  return (
    <div>
      <form className="p-fluid">
        {btnText == "Add" && (
          <div className="field">
            <span>
              <label htmlFor="name" className={classNames({ "p-error": !!errors.links })}>
                Nguồn dữ liệu
              </label>
              <Controller
                name="links"
                control={control}
                rules={{
                  validate: (e) => {
                    if (!!e?.trim()) return true;
                    else return "Yêu cầu nhập nguồn dữ liệu";
                  },
                }}
                render={({ field, fieldState }) => <InputTextarea id={field.name} rows={10} {...field} className={classNames({ "p-invalid": fieldState.invalid })} placeholder="Nhập liên kết tới nguồn dữ liệu mỗi liên kết nằm trên 1 dòng" />}
              />
              <div className="select-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '65%', justifyContent: 'space-between' }}>
                  <Select
                    value={selectedOption}
                    onChange={handleSelectChange}
                    onInputChange={handleInputChange}
                    options={categories.map(category => ({
                      label: category.name,
                      value: category.id
                    }))}
                    isSearchable
                    placeholder="Chọn danh mục cho nguồn..."
                    style={{ width: 500 }}
                    components={{
                      NoOptionsMessage: customNoOptionsMessage,
                      //Option: CustomOption
                    }}
                  //isMulti
                  />
                  {selectedOption && (
                    <button className="delete-button" onClick={handleRemoveSelectedOption}>
                      Xoá danh mục
                    </button>
                  )}
                </div>
              </div>
            </span>
            {getFormErrorMessage("links")}
          </div>
        )}

        {btnText == "Edit" && (
          <div>
            {/* <div className="field">
              <span>
                <label htmlFor="tagIds" className={classNames({ "p-error": !!errors.links })}>
                  Thẻ
                </label>
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field, fieldState }) =>
                    <AutoComplete
                      dropdown
                      multiple
                      field="label"
                      value={field.value}
                      onKeyPress={enterNoExit}
                      suggestions={filterTags}
                      onDropdownClick={() => setFilterTags([...filterTags])}
                      completeMethod={searchTags}
                      onChange={(e) => field.onChange(e.value)}
                    />
                  }
                />
              </span>
              {getFormErrorMessage("tagIds")}
            </div> */}
            <div className="field">
              <span>
                <label htmlFor="categoryId" className={classNames({ "p-error": !!errors.links })}>
                  Thể loại
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Select
                      value={selectedOption}
                      onChange={handleSelectChange}
                      onInputChange={handleInputChange}
                      options={categories.map(category => ({
                        label: category.name,
                        value: category.id
                      }))}
                      isSearchable
                      field='label'
                      placeholder={categories.find(item => item.id === field.value) ? categories.find(item => item.id === field.value).name : 'Không xác định'}
                      style={{ width: 500 }}
                      components={{
                        NoOptionsMessage: customNoOptionsMessage
                      }}
                    />
                  )}
                />
              </span>
              {getFormErrorMessage("tagIds")}
            </div>
            <div className="field">
              <span>
                <label htmlFor="profileIds" className={classNames({ "p-error": !!errors.links })}>
                  Hồ sơ
                </label>
                <Controller
                  name="profileIds"
                  control={control}
                  render={({ field, fieldState }) => (
                    <AutoComplete
                      dropdown
                      multiple
                      field="label"
                      value={field.value}
                      onKeyPress={enterNoExitProfiles}
                      suggestions={filterProfiles}
                      onDropdownClick={() => setFilterProfiles([...filterProfiles])}
                      completeMethod={searchProfiles}
                      onChange={(e) => field.onChange(e.value)}
                      onSelect={(e) => selectProfile(e)}
                      onUnselect={(e) => unSelectProfile(e)}
                    />
                  )}
                />
              </span>
              {getFormErrorMessage("profileIds")}
            </div>

            <div className="field">
              <span>
                <label htmlFor="name" className={classNames({ "p-error": !!errors.links })}>
                  Tên nguồn dữ liệu
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) =>
                    <InputText
                      disabled
                      name={field.name}
                      {...field}
                    />
                  } />
              </span>
            </div>
            <div className="field">
              <span>
                <label htmlFor="link" className={classNames({ "p-error": !!errors.links })}>
                  Liên kết
                </label>
                <Controller name="link" control={control} render={({ field, fieldState }) => <InputText disabled name={field.name} {...field} />} />
              </span>
            </div>
            {getValues("type") == "GOOGLE_SEARCH_WEBSITE" ? (
              <div className="field">
                <span>
                  <label htmlFor="type" className={classNames({ "p-error": !!errors.links })}>
                    Phân loại
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        id={field.name}
                        value={field.value}
                        {...field}
                        options={[
                          { name: "WEBSITE", value: "WEBSITE" },
                          { name: "GOOGLE_SEARCH_WEBSITE", value: "GOOGLE_SEARCH_WEBSITE" },
                        ]}
                        optionLabel="value"
                      />
                    )}
                  />
                </span>
              </div>
            ) : (
              <div className="field">
                <span>
                  <label htmlFor="type" className={classNames({ "p-error": !!errors.links })}>
                    Phân loại
                  </label>
                  <Controller name="type" control={control} render={({ field, fieldState }) => <InputText disabled name={field.name} {...field} />} />
                </span>
              </div>
            )}
            <div className="field">
              <span>
                <label htmlFor="status" className={classNames({ "p-error": !!errors.links })}>
                  Trạng thái
                </label>
                <Controller name="status" control={control} render={({ field, fieldState }) => <InputText disabled name={field.name} {...field} />} />
              </span>
            </div>
          </div>
        )}

        <div className="text-right">
          <Button type="button" onClick={handleSubmit(onSubmit)} label={btnText == "Edit" ? "Cập nhật" : "Thêm"} className="mt-2 inline-block w-auto" />
        </div>
      </form>
    </div>
  );
}

export default Form;
